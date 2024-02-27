import { ASSETS, CURRENCIES } from '@commons/constants/currencies';
import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import Big from 'big.js';
import {
  BookTicker,
  HighLowIntervalPrice,
  HighLowIntervalSubscribers,
  ISymbolTickerStreamPayload,
  MarketPrice,
  SymbolTicker,
  Ticker,
} from '@modules/price/types';
import { Exception } from '@commons/constants/exception';
import Redis from 'ioredis';
import config from '@configs/configuration';
import { NamiSlack } from '@commons/modules/logger/platforms/slack.module';
import {
  CRON_EXPRESSION,
  SECONDS_TO_MILLISECONDS,
  USDT_VNDC_CENTER_RATE,
} from '@commons/constants';
import { REDIS_PROVIDER } from '@databases/redis/redis.providers';
import { io } from 'socket.io-client';
import axios from 'axios';
import { getMarketPriceHttp } from '@commons/utils/market';
import Bluebird from 'bluebird';

@Injectable({
  scope: Scope.DEFAULT,
})
export class PriceService {
  private readonly MARKET_STREAMS_URL = 'https://stream-asia2.nami.exchange';
  private readonly redisPrice: Redis;
  private readonly PRICE_SPREAD_RATIO = 0;
  private readonly PRICE_DECIMAL = 8;

  /**
   * @Public
   * @description Current price of all listed symbols
   *
   * @returns
   * @example
   * {
   *   'BTCUSDT': {
   *      'symbol': 'BTCUSDT',
   *      'bestBid': 26980, (gia mua thap nhat)
   *      'bestAsk': 27020, (gia ban cao nhat)
   *      'lastPrice': 27000 (gia hien tai)
   *   },
   *   'ETHUSDT': {
   *      ...
   *   },
   *   ...
   * }
   */
  public readonly bookTickers: BookTicker = {};

  private readonly highLowIntervalSubscribers: HighLowIntervalSubscribers = {};

  constructor(
    @Inject(REDIS_PROVIDER.PRICE) private readonly redis: Redis,
    private readonly namiSlack: NamiSlack,
  ) {
    this.redisPrice = this.redis ?? new Redis(config.REDIS.PRICE.URI);
    this.initAllTickersData();
    this.initSymbolTickersStream();
    this.updateNaoAndNamiMarketPrice();
  }

  private initAllTickersData(filter?: (e) => boolean) {
    axios
      .get('https://nami.exchange/api/v3/spot/market_watch')
      .then(({ data }) => {
        if (filter) data.data = data?.data?.filter(filter);
        data?.data?.map((e) => {
          const LAST_7_DAYS = 1000 * 60 * 60 * 24 * 7;
          if (Date.now() - e.t > LAST_7_DAYS) return;
          if (e?.s === 'USDTVNDC') {
            this.updateUsdtVndcBookTicker(e);
          } else {
            this.processPriceStream(e);
          }
        });
      });
  }

  /**
   * @tutorial you can use any list of symbol you want (symbols must be listed on Nami)
   *
   * @example ['BTCUSDT', 'ETHUSDT', ...]
   *
   * @default `in this example im using symbol list from exchangeconfigs`
   */
  private initSymbolTickersStream(symbols?: string[]) {
    const socket = io(this.MARKET_STREAMS_URL, {
      transports: ['websocket'],
      upgrade: false,
      path: '/ws',
      reconnection: true,
      reconnectionDelay: SECONDS_TO_MILLISECONDS.FIVE,
      reconnectionDelayMax: SECONDS_TO_MILLISECONDS.TEN,
      reconnectionAttempts: Infinity,
    });
    socket.on('connect', () => {
      console.log('--PRICE SOCKET CONNECTED--');
      socket.emit('subscribe:mini_ticker', symbols ?? 'all');
    });
    socket.on('disconnect', () => {
      console.log('--PRICE SOCKET DISCONNECTED--');
    });
    socket.on('spot:mini_ticker:update', (data: ISymbolTickerStreamPayload) => {
      this.processPriceStream(data);
    });
  }

  private processPriceStream(payload: ISymbolTickerStreamPayload) {
    try {
      const data = new SymbolTicker(payload);
      const usdtConvertRate = {
        bid: 1 - this.PRICE_SPREAD_RATIO,
        ask: 1 + this.PRICE_SPREAD_RATIO,
        price: 1,
      };
      this.updateBookTicker(data, usdtConvertRate);
    } catch (error) {
      console.error(error);
      this.namiSlack.sendSlackMessage(
        'processPriceStream ERROR',
        new Error(error),
      );
    }
  }

  private updateBookTicker(
    data: SymbolTicker,
    rate: { bid: number; ask: number; price: number },
  ) {
    const symbol = data.symbol;
    const { lastPrice: currentPrice } = data;
    const _lastPrice = Number(
      Big(currentPrice).times(rate.price).toFixed(this.PRICE_DECIMAL),
    );
    const lastTickerPrice = this.bookTickers?.[symbol]?.lastPrice ?? 0;
    let matchOrderAction = 'buy';
    if (lastTickerPrice > 0) {
      matchOrderAction = currentPrice > lastTickerPrice ? 'buy' : 'sell';
    }
    const closeBuy = Number(
      Big(currentPrice).times(rate.bid).toFixed(this.PRICE_DECIMAL),
    );
    const closeSell = Number(
      Big(currentPrice).times(rate.ask).toFixed(this.PRICE_DECIMAL),
    );
    const closePrice = matchOrderAction === 'buy' ? closeSell : closeBuy;
    const priceData: Ticker = {
      symbol,
      bestBid: closePrice,
      bestAsk: closePrice,
      lastPrice: _lastPrice,
    };
    this.bookTickers[symbol] = priceData;
    this.updateHighLowInterval(symbol, priceData);
  }

  private async updateUsdtVndcBookTicker(
    usdtVndcPrice: ISymbolTickerStreamPayload,
  ) {
    let p = usdtVndcPrice?.p;
    if (!p) {
      p = USDT_VNDC_CENTER_RATE?.USDT_VNDC_RATE;
    }
    Bluebird.map(
      [
        {
          symbol: 'VNDCVNST',
          bestBid: 1,
          bestAsk: 1,
          lastPrice: 1,
        },
        {
          symbol: 'VNSTVNDC',
          bestBid: 1,
          bestAsk: 1,
          lastPrice: 1,
        },
        {
          symbol: 'VNDCUSDT',
          bestBid: Number(Big(1).div(p).toFixed(this.PRICE_DECIMAL)),
          bestAsk: Number(Big(1).div(p).toFixed(this.PRICE_DECIMAL)),
          lastPrice: Number(Big(1).div(p).toFixed(this.PRICE_DECIMAL)),
        },
        {
          symbol: 'VNSTUSDT',
          bestBid: Number(Big(1).div(p).toFixed(this.PRICE_DECIMAL)),
          bestAsk: Number(Big(1).div(p).toFixed(this.PRICE_DECIMAL)),
          lastPrice: Number(Big(1).div(p).toFixed(this.PRICE_DECIMAL)),
        },
        {
          symbol: 'USDTVNDC',
          bestBid: p,
          bestAsk: p,
          lastPrice: p,
        },
        {
          symbol: 'USDTVNST',
          bestBid: p,
          bestAsk: p,
          lastPrice: p,
        },
      ],
      (e) => {
        this.bookTickers[e.symbol] = e;
        this.updateHighLowInterval(e.symbol, e);
      },
      { concurrency: 6 },
    );
  }

  private initHighLowFromBookTickers(symbol: string) {
    if (!this.bookTickers[symbol]) return;
    this.updateHighLowInterval(symbol, this.bookTickers[symbol]);
  }

  private updateHighLowInterval(symbol: string, price: Ticker) {
    Object.keys(this.highLowIntervalSubscribers).map((name) => {
      const { subscription, interval } = this.highLowIntervalSubscribers[name];
      const { bestBid, bestAsk } = price;
      if (!bestBid && !bestAsk) return;
      const symbolPrice = {
        bidLow: bestBid,
        bidHigh: bestBid,
        askLow: bestAsk,
        askHigh: bestAsk,
        lastTick: Date.now(),
      };
      if (this.highLowIntervalSubscribers[name]?.reset) {
        this.highLowIntervalSubscribers[name].reset = false;
        setTimeout(async () => {
          subscription(this.highLowIntervalSubscribers[name]?.price);
          this.highLowIntervalSubscribers[name].reset = true;
        }, interval);
        this.highLowIntervalSubscribers[name].price = {
          [symbol]: symbolPrice,
        };
        [
          'NAMIVNDC',
          'NAMIVNST',
          'NAMIUSDT',
          'NAOVNDC',
          'NAOVNST',
          'NAOUSDT',
          'VNDCVNST',
          'VNDCUSDT',
          'VNSTVNDC',
          'VNSTUSDT',
          'USDTVNDC',
          'USDTVNST',
        ].map((e) => {
          this.initHighLowFromBookTickers(e);
        });
      } else {
        if (!this.highLowIntervalSubscribers[name]?.price?.[symbol]) {
          this.highLowIntervalSubscribers[name].price[symbol] = symbolPrice;
        } else {
          const currentHighLow =
            this.highLowIntervalSubscribers[name]?.price?.[symbol];
          if (!currentHighLow.bidLow || currentHighLow.bidLow >= bestBid) {
            currentHighLow.bidLow = bestBid;
          }
          if (!currentHighLow.askLow || currentHighLow.askLow >= bestAsk) {
            currentHighLow.askLow = bestAsk;
          }
          if (!currentHighLow.bidHigh || currentHighLow.bidHigh <= bestBid) {
            currentHighLow.bidHigh = bestBid;
          }
          if (!currentHighLow.askHigh || currentHighLow.askHigh <= bestBid) {
            currentHighLow.askHigh = bestAsk;
          }
          this.highLowIntervalSubscribers[name].price[symbol] = currentHighLow;
        }
      }
    });
  }

  // moi 3 giay update gia cua NAO NAMI ve book tickers
  @Cron(CRON_EXPRESSION.EVERY_3_SECONDS)
  private async updateNaoAndNamiMarketPrice() {
    const usdtVndcPrice = this.bookTickers?.USDTVNDC?.lastPrice;
    if (isNaN(usdtVndcPrice)) return;
    const [NAOVNDCPrice, NAMIVNDCPrice, NAOVNSTPrice, NAMIVNSTPrice] =
      await Promise.all([
        this.getMarketPrice(CURRENCIES.NAO, CURRENCIES.VNDC),
        this.getMarketPrice(CURRENCIES.NAMI, CURRENCIES.VNDC),
        this.getMarketPrice(CURRENCIES.NAO, CURRENCIES.VNST),
        this.getMarketPrice(CURRENCIES.NAMI, CURRENCIES.VNST),
      ]);
    const naoPrice = Number(NAOVNDCPrice?.p || 1400);
    const naoVnstPrice = Number(NAOVNSTPrice?.p || naoPrice);
    [
      {
        symbol: 'NAOVNDC',
        bestBid: naoPrice,
        bestAsk: naoPrice,
        lastPrice: naoPrice,
      },
      {
        symbol: 'NAOVNST',
        bestBid: naoVnstPrice,
        bestAsk: naoVnstPrice,
        lastPrice: naoVnstPrice,
      },
      {
        symbol: 'NAOUSDT',
        bestBid: Number(
          Big(naoPrice).div(usdtVndcPrice).toFixed(this.PRICE_DECIMAL),
        ),
        bestAsk: Number(
          Big(naoPrice).div(usdtVndcPrice).toFixed(this.PRICE_DECIMAL),
        ),
        lastPrice: Number(
          Big(naoPrice).div(usdtVndcPrice).toFixed(this.PRICE_DECIMAL),
        ),
      },
    ].map((e) => {
      this.bookTickers[e.symbol] = e;
      this.updateHighLowInterval(e.symbol, e);
    });
    const namiPrice = Number(NAMIVNDCPrice?.p || 360);
    const namiVnstPrice = Number(NAMIVNSTPrice?.p || namiPrice);
    [
      {
        symbol: 'NAMIVNDC',
        bestBid: namiPrice,
        bestAsk: namiPrice,
        lastPrice: namiPrice,
      },
      {
        symbol: 'NAMIVNST',
        bestBid: namiVnstPrice,
        bestAsk: namiVnstPrice,
        lastPrice: namiVnstPrice,
      },
      {
        symbol: 'NAMIUSDT',
        bestBid: Number(
          Big(namiPrice).div(usdtVndcPrice).toFixed(this.PRICE_DECIMAL),
        ),
        bestAsk: Number(
          Big(namiPrice).div(usdtVndcPrice).toFixed(this.PRICE_DECIMAL),
        ),
        lastPrice: Number(
          Big(namiPrice).div(usdtVndcPrice).toFixed(this.PRICE_DECIMAL),
        ),
      },
    ].map((e) => {
      this.bookTickers[e.symbol] = e;
      this.updateHighLowInterval(e.symbol, e);
    });
  }

  /**
   * @Public
   * @description get market price of symbol
   *
   * @param base	base asset (eg: NAMI)
   * @param quote	quote asset (eg: VNDC)
   *
   * @example
   * this.priceService.getMarketPrice(
   *   'NAMI',
   *   'VNDC',
   * );
   */
  public async getMarketPrice(base: number, quote: number) {
    const REDIS_EXCHANGE_PRICE_KEY = 'market_watch';
    const hash = `${REDIS_EXCHANGE_PRICE_KEY}:${quote}`;
    const key = String(base);

    const price = await this.redisPrice.hget(hash, key);
    if (price) {
      const parsed = JSON.parse(price);
      return new MarketPrice(parsed);
    }
    try {
      const alternativePrice = await getMarketPriceHttp(
        `${ASSETS[base]}${ASSETS[quote]}`,
      );
      if (alternativePrice?.p) {
        return new MarketPrice(alternativePrice);
      }
    } catch (error) {}
    return { p: null };
  }

  /**
   * @Public
   * @description subscribe for high and low price in an interval with a callback
   *
   * @param name	what ever u want, must be unique
   * @param interval	your interval time for high and low price (in ms)
   * @param cb	your callback func that need high and low price as payload
   *
   * @example
   * this.priceService.subscribeHighLowInterval(
   *   'demo',
   *   3000,
   *   (data: HighLowIntervalPrice) => handlePriceData(data)
   * );
   */
  public subscribeHighLowInterval(
    name: string,
    interval: number,
    cb: (data: HighLowIntervalPrice) => void,
  ) {
    if (this.highLowIntervalSubscribers[name]) {
      throw new BadRequestException(Exception.EXISTED(`subscriber ${name}`));
    }
    this.highLowIntervalSubscribers[name] = {
      subscription: cb,
      interval,
      price: null,
      reset: true,
    };
  }

  /**
   * @Public
   *
   * @description Returns the price of a symbol or pair of symbols.
   *
   * @param symbol - The symbol to get the price for.
   * @param pair - An optional object containing the base and quote symbols for the pair.
   *
   * @returns An object containing the best bid, best ask, and last price of the symbol or pair, or null if the price cannot be determined.
   */
  public price(
    symbol: string,
    pair?: { base?: string; quote?: string },
    _bookTickers?: BookTicker,
  ): Ticker {
    const bookTickers = _bookTickers || this.bookTickers;
    const price = bookTickers[symbol];
    if (price) return price;
    const quotes = [
      ASSETS[CURRENCIES.VNST],
      ASSETS[CURRENCIES.VNDC],
      ASSETS[CURRENCIES.USDT],
    ];
    const _quote =
      quotes.find((e) => e !== pair.base && e !== pair.quote) ??
      ASSETS[CURRENCIES.USDT];
    const baseTicker: Ticker = {
      bestAsk: 1,
      bestBid: 1,
      lastPrice: 1,
      symbol: null,
    };
    const basePrice =
      pair.base === _quote ? baseTicker : bookTickers[`${pair.base}${_quote}`];
    const quotePrice =
      pair.quote === _quote
        ? baseTicker
        : bookTickers[`${pair.quote}${_quote}`];
    if (!basePrice || !quotePrice) {
      return null;
    }
    return {
      symbol,
      bestBid: Number(
        Big(basePrice.bestBid)
          .div(quotePrice.bestBid)
          .toFixed(this.PRICE_DECIMAL),
      ),
      bestAsk: Number(
        Big(basePrice.bestAsk)
          .div(quotePrice.bestAsk)
          .toFixed(this.PRICE_DECIMAL),
      ),
      lastPrice: Number(
        Big(basePrice.lastPrice)
          .div(quotePrice.lastPrice)
          .toFixed(this.PRICE_DECIMAL),
      ),
    };
  }

  public highLowPrice(
    symbol: string,
    pair: { base?: string; quote?: string },
    highLow: HighLowIntervalPrice,
  ) {
    const price = highLow[symbol];
    if (price) return price;
    const quotes = [
      ASSETS[CURRENCIES.VNST],
      ASSETS[CURRENCIES.VNDC],
      ASSETS[CURRENCIES.USDT],
    ];
    const _quote =
      quotes.find((e) => e !== pair.base && e !== pair.quote) ??
      ASSETS[CURRENCIES.USDT];

    const base = {
      bidLow: 1,
      askLow: 1,
      bidHigh: 1,
      askHigh: 1,
      lastTick: 1,
    };
    const basePrice =
      pair.base === _quote ? base : highLow[`${pair.base}${_quote}`];
    const quotePrice =
      pair.quote === _quote ? base : highLow[`${pair.quote}${_quote}`];
    if (!basePrice || !quotePrice) {
      console.warn('no price found!', symbol);
      return null;
    }
    return {
      bidLow: Number(
        Big(basePrice.bidLow)
          .div(quotePrice.bidLow)
          .toFixed(this.PRICE_DECIMAL),
      ),
      askLow: Number(
        Big(basePrice.askLow)
          .div(quotePrice.askLow)
          .toFixed(this.PRICE_DECIMAL),
      ),
      bidHigh: Number(
        Big(basePrice.bidHigh)
          .div(quotePrice.bidHigh)
          .toFixed(this.PRICE_DECIMAL),
      ),
      askHigh: Number(
        Big(basePrice.askHigh)
          .div(quotePrice.askHigh)
          .toFixed(this.PRICE_DECIMAL),
      ),
      lastTick: basePrice.lastTick,
    };
  }
}
