import { BadRequestException, Injectable, Scope } from '@nestjs/common';
import Big from 'big.js';
import {
  BookTicker,
  HighLowIntervalPrice,
  HighLowIntervalSubscribers,
  ISymbolTickerStreamPayload,
  SymbolTicker,
  Ticker,
} from '@modules/price/types';
import { WebSocket } from 'ws';
import { Exception } from '@commons/constants/exception';
import { Slack } from '@commons/modules/logger/platforms/slack.module';
import { CRON_EXPRESSION, SECONDS_TO_MILLISECONDS } from '@commons/constants';
import config from '@configs/configuration';
import { Cron } from '@nestjs/schedule';

@Injectable({
  scope: Scope.DEFAULT,
})
export class PriceService {
  private readonly BINANCE_MARKET_STREAMS_URL = 'wss://stream.binance.com:9443';
  private readonly PRICE_SPREAD_RATIO = 0.0001;
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

  constructor(private readonly slack: Slack) {
    this.init();
  }

  @Cron(CRON_EXPRESSION.VIETNAM_MIDNIGHT)
  protected init() {
    this.initSymbolTickersStream();
  }

  /**
   * @tutorial you can use any list of symbol you want (symbols must be listed on Binance)
   *
   * @example ['BTCUSDT', 'ETHUSDT', ...]
   *
   * @default `in this example im using symbol list from exchangeconfigs`
   */
  private initSymbolTickersStream(symbols = ['BTCUSDT']) {
    symbols.map((e) => this.startSymbolTickerStream(e));
  }

  private startSymbolTickerStream(symbol: string, retry = 0) {
    symbol = symbol.toUpperCase();
    if (retry > config.NICE) {
      console.error(`Failed to stream ${symbol} ticker`);
      this.slack.sendSlackMessage(`Failed to stream ${symbol} ticker`);
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
    binancePriceStream.on('ping', () => {
      binancePriceStream.pong();
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
      const data = new SymbolTicker(payload);
      const usdtConvertRate = {
        bid: 1 - this.PRICE_SPREAD_RATIO,
        ask: 1 + this.PRICE_SPREAD_RATIO,
        price: 1,
      };
      this.updateBookTicker(data, usdtConvertRate);
    } catch (error) {
      console.error(error);
      this.slack.sendSlackMessage('processPriceStream ERROR', new Error(error));
    }
  }

  private updateBookTicker(
    data: SymbolTicker,
    rate: { bid: number; ask: number; price: number },
  ) {
    const symbol = data.symbol;
    const { lastPrice: currentPrice } = data;
    // const _lastPrice = currentPrice * rate.price;
    const _lastPrice = Number(
      Big(currentPrice).times(rate.price).toFixed(this.PRICE_DECIMAL),
    );
    const lastTickerPrice = this.bookTickers?.[symbol]?.lastPrice ?? 0;
    const actions = {
      buy: 'buy',
      sell: 'sell',
    };
    let matchOrderAction = actions.buy;
    if (lastTickerPrice > 0) {
      matchOrderAction = Big(currentPrice).gt(lastTickerPrice)
        ? actions.buy
        : actions.sell;
    }
    const closeBuy = Number(
      Big(currentPrice).times(rate.bid).toFixed(this.PRICE_DECIMAL),
    );
    const closeSell = Number(
      Big(currentPrice).times(rate.ask).toFixed(this.PRICE_DECIMAL),
    );
    const closePrice = matchOrderAction === actions.buy ? closeSell : closeBuy;
    const priceData: Ticker = {
      symbol,
      bestBid: closePrice,
      bestAsk: closePrice,
      lastPrice: _lastPrice,
    };
    this.bookTickers[symbol] = priceData;
    this.updateHighLowInterval(symbol, priceData);
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
}
