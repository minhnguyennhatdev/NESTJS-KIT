import { ReadPreference } from 'mongodb';
import { ASSETS, CURRENCIES } from '@commons/constants/currencies';
import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
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
import { WebSocket } from 'ws';
import { Exception } from '@commons/constants/exception';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import Redis from 'ioredis';
import config from '@configs/configuration';
import { NamiSlack } from '@commons/modules/logger/platforms/slack.module';
import { SECONDS_TO_MILLISECONDS } from '@commons/constants';
import Bluebird from 'bluebird';
import { REDIS_PROVIDER } from '@databases/redis/redis.providers';

@Injectable({
  scope: Scope.DEFAULT,
})
export class PriceService {
  private readonly BINANCE_MARKET_STREAMS_URL = 'wss://stream.binance.com:9443';
  private readonly redisPrice: Redis;
  private readonly PRICE_SPREAD_RATIO = config.PRICE_SPREAD_RATIO;

  /**
   * @Public
   * @description USDT/VNDC Market Rate (updated each 10 minutes)
   */
  public readonly USDT_VNDC_RATE = {
    bid: 24000 - 120,
    ask: 24000 + 120,
    price: 24000,
  };

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
    @InjectConnection() private readonly connection: Connection,
    @Inject(REDIS_PROVIDER.PRICE) private readonly redis: Redis,
    private readonly namiSlack: NamiSlack,
  ) {
    this.redisPrice = this.redis ?? new Redis(config.REDIS.PRICE.URI);
    this.initSymbolTickersStream();
    this.updateUsdtVndcMarketPrice();
    this.updateNaoAndNamiMarketPrice();
  }

  /**
   * @tutorial you can use any list of symbol you want (symbols must be listed on Binance)
   *
   * @example ['BTCUSDT', 'ETHUSDT', ...]
   *
   * @default `in this example im using symbol list from exchangeconfigs`
   */
  private initSymbolTickersStream() {
    this.connection
      .collection('exchangeconfigs', {
        readPreference: ReadPreference.SECONDARY,
      })
      .find({ liquidityBroker: 'BINANCE_SPOT', quoteAssetId: CURRENCIES.USDT })
      .project<{ symbol: string }>({
        symbol: true,
      })
      .toArray()
      .then((data) => {
        console.log(`Init ticker stream of ${data.length} symbols`);
        data.map((e) => this.startSymbolTickerStream(e.symbol));
      });
  }

  private startSymbolTickerStream(symbol: string, retry = 0) {
    symbol = symbol.toUpperCase();
    if (retry > 3) {
      console.error(`Failed to stream ${symbol} ticker`);
      this.namiSlack.sendSlackMessage(`Failed to stream ${symbol} ticker`);
      return;
    }
    const binancePriceStream = new WebSocket(
      `${this.BINANCE_MARKET_STREAMS_URL}/ws/${symbol?.toLowerCase()}@ticker`,
      {
        timeout: 5000,
      },
    );
    binancePriceStream.on('open', () => {
      console.log(`${symbol} ticker stream connected`);
    });
    binancePriceStream.on('error', () => {
      console.error(`${symbol} ticker stream error`);
    });
    binancePriceStream.on('close', () => {
      console.error(`${symbol} ticker stream close`);
      console.error(`Retried to stream ${symbol}: ${retry}`);
      setTimeout(
        () => this.startSymbolTickerStream(symbol, retry + 1),
        SECONDS_TO_MILLISECONDS.ONE,
      );
    });
    binancePriceStream.on('message', (payload: string) =>
      this.processPriceStream(payload),
    );
  }

  private processPriceStream(_payload: string) {
    const payload: ISymbolTickerStreamPayload = JSON.parse(_payload);
    try {
      if (payload?.s?.startsWith('DODOX')) {
        payload.s = payload?.s?.replace('DODOX', 'DODO');
      }
      const data = new SymbolTicker(payload);
      const usdtConvertRate = {
        bid: 1 - this.PRICE_SPREAD_RATIO,
        ask: 1 + this.PRICE_SPREAD_RATIO,
        price: 1,
      };
      const vndcConvertRate = {
        bid: Number(Big(usdtConvertRate.bid).times(this.USDT_VNDC_RATE.bid)),
        ask: Number(Big(usdtConvertRate.ask).times(this.USDT_VNDC_RATE.ask)),
        price: Number(
          Big(usdtConvertRate.price).times(this.USDT_VNDC_RATE.price),
        ),
      };
      this.updateBookTicker(data, usdtConvertRate);
      this.updateBookTicker(
        data.convertQuoteAsset(ASSETS[CURRENCIES.VNDC]),
        vndcConvertRate,
      );
      this.updateBookTicker(
        data.convertQuoteAsset(ASSETS[CURRENCIES.VNST]),
        vndcConvertRate,
      );
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
    const _lastPrice = currentPrice * rate.price;
    const lastTickerPrice = this.bookTickers?.[symbol]?.lastPrice ?? 0;
    let matchOrderAction = 'buy';
    if (lastTickerPrice > 0) {
      matchOrderAction = currentPrice > lastTickerPrice ? 'buy' : 'sell';
    }
    const closeBuy = Number(Big(currentPrice).times(rate.bid));
    const closeSell = Number(Big(currentPrice).times(rate.ask));
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

  private initHighLowFromBookTickers(symbol: string) {
    if (!this.bookTickers[symbol]) return;
    this.updateHighLowInterval(symbol, this.bookTickers[symbol]);
  }

  private updateHighLowInterval(symbol: string, price: Ticker) {
    Object.keys(this.highLowIntervalSubscribers).map((name) => {
      const { subscription, interval } = this.highLowIntervalSubscribers[name];
      const { bestBid, bestAsk } = price;
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

  // moi 1 phut fetch lai gia market USDTVNDC
  @Cron(CronExpression.EVERY_MINUTE)
  protected async updateUsdtVndcMarketPrice() {
    const USDTPrice = await this.getMarketPrice(
      CURRENCIES.USDT,
      CURRENCIES.VNDC,
    );
    // if (!USDTPrice?.p) return;
    let { p } = USDTPrice;
    if (!p) {
      if (this.USDT_VNDC_RATE?.price) {
        p = this.USDT_VNDC_RATE.price;
      } else {
        return;
      }
    }
    this.USDT_VNDC_RATE.bid = p;
    this.USDT_VNDC_RATE.ask = p;
    this.USDT_VNDC_RATE.price = Number(p);
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
          bestBid: Number(Big(1).div(p)),
          bestAsk: Number(Big(1).div(p)),
          lastPrice: Number(Big(1).div(p)),
        },
        {
          symbol: 'VNSTUSDT',
          bestBid: Number(Big(1).div(p)),
          bestAsk: Number(Big(1).div(p)),
          lastPrice: Number(Big(1).div(p)),
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

  // moi 3 giay update gia cua NAO NAMI ve book tickers
  @Cron('*/3 * * * * *')
  protected async updateNaoAndNamiMarketPrice() {
    if (isNaN(this.USDT_VNDC_RATE.price)) return;
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
        bestBid: Number(Big(naoPrice).div(this.USDT_VNDC_RATE.bid)),
        bestAsk: Number(Big(naoPrice).div(this.USDT_VNDC_RATE.ask)),
        lastPrice: Number(Big(naoPrice).div(this.USDT_VNDC_RATE.price)),
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
        bestBid: Number(Big(namiPrice).div(this.USDT_VNDC_RATE.bid)),
        bestAsk: Number(Big(namiPrice).div(this.USDT_VNDC_RATE.ask)),
        lastPrice: Number(Big(namiPrice).div(this.USDT_VNDC_RATE.price)),
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
      bestBid: Number(Big(basePrice.bestBid).div(quotePrice.bestBid)),
      bestAsk: Number(Big(basePrice.bestAsk).div(quotePrice.bestAsk)),
      lastPrice: Number(Big(basePrice.lastPrice).div(quotePrice.lastPrice)),
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
      console.log('no price wtf');
      return null;
    }
    return {
      bidLow: Number(Big(basePrice.bidLow).div(quotePrice.bidLow)),
      askLow: Number(Big(basePrice.askLow).div(quotePrice.askLow)),
      bidHigh: Number(Big(basePrice.bidHigh).div(quotePrice.bidHigh)),
      askHigh: Number(Big(basePrice.askHigh).div(quotePrice.askHigh)),
      lastTick: basePrice.lastTick,
    };
  }
}
