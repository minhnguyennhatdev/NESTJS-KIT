import { ASSETS, CURRENCIES } from '@commons/constants/currencies';
import { Exception } from '@commons/constants/exception';
import { BadRequestException } from '@nestjs/common';

export type Ticker = {
  symbol: string;
  bestBid: number; // gia mua
  bestAsk: number; // gia ban
  lastPrice: number;
};

export type BookTicker = Record<string, Ticker>;

/**
 * @example
 * {
 *   'BTCUSDT': {
 *      'symbol': 'BTCUSDT',
 *      'bidLow': 27020,
 *      'askLow': 27020,
 *      'bidHigh': 27000,
 *      'askHigh': 27000,
 *      'lastTick': Date.now()
 *   },
 *   'ETHUSDT': {
 *      ...
 *   },
 *   ...
 * }
 */
export type HighLowIntervalPrice = Record<
  string,
  {
    bidLow: number;
    askLow: number;
    bidHigh: number;
    askHigh: number;
    lastTick: number;
  }
>;

export type HighLowIntervalSubscribers = Record<
  string,
  {
    subscription: (data: HighLowIntervalPrice) => void;
    interval: number;
    price?: HighLowIntervalPrice;
    reset: boolean;
  }
>;

export interface ISymbolTickerStreamPayload {
  s: string; // symbol
  b: string; // base
  bi: number; // base id
  q: string; // quote
  qi: number; // quote id
  t: number; // time
  p: number; // last price
  ld: number; // last day price
  vc: number; // volume change
}

export class SymbolTicker {
  symbol: string;
  base: string;
  quote: string;
  lastPrice: number;
  highPrice: number;
  lowPrice: number;
  constructor(payload: ISymbolTickerStreamPayload) {
    this.symbol = String(payload.s); // Symbol
    this.base = String(payload.b); // Base asset
    this.quote = String(payload.q); // Quote Asset
    this.lastPrice = Number(payload.p); // Last price
  }
  public convertQuoteAsset(quote: string) {
    quote = quote.toUpperCase();
    if (![ASSETS[CURRENCIES.VNDC], ASSETS[CURRENCIES.VNST]].includes(quote)) {
      throw new BadRequestException(Exception.INVALID('quote asset'));
    }
    this.quote = quote;
    this.symbol = this.base + this.quote;
    return this;
  }
}

export class MarketPrice {
  s: string; // symbol
  b: string; // base
  bi: number; // base id
  q: string; // quote
  qi: number; // quote id
  p: number; // price
  h: number; // high
  l: number; // low
  t: number; // time
  hh: number; // high 1h
  lh: number; // low 1h
  constructor(payload) {
    this.s = String(payload.s);
    this.b = String(payload.b);
    this.bi = Number(payload.bi);
    this.q = String(payload.q);
    this.qi = Number(payload.qi);
    this.p = Number(payload.p);
    this.h = Number(payload.h);
    this.l = Number(payload.l);
    this.t = Number(payload.t);
    this.hh = Number(payload.hh);
    this.lh = Number(payload.lh);
  }
}
