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
  E: number; // 123456789; // Event time
  e: string; // '24hrTicker'; // Event type
  s: string; // 'BNBBTC'; // Symbol
  p: string; // '0.0015'; // Price change
  P: string; // '250.00'; // Price change percent
  w: string; // '0.0018'; // Weighted average price
  x: string; // '0.0009'; // First trade(F)-1 price (first trade before the 24hr rolling window)
  c: string; // '0.0025'; // Last price
  Q: string; // '10'; // Last quantity
  b: string; // '0.0024'; // Best bid price
  B: string; // '10'; // Best bid quantity
  a: string; // '0.0026'; // Best ask price
  A: string; // '100'; // Best ask quantity
  o: string; // '0.0010'; // Open price
  h: string; //  '0.0025'; // High price
  l: string; //'0.0010'; // Low price
  v: string; // '10000'; // Total traded base asset volume
  q: string; // '18'; // Total traded quote asset volume
  O: number; // 0; // Statistics open time
  C: number; // 86400000; // Statistics close time
  F: number; // 0; // First trade ID
  L: number; // 18150; // Last trade Id
  n: number; // 18151; // Total number of trades
}

export class SymbolTicker {
  symbol: string;
  base: string;
  quote: string;
  priceChange: number;
  priceChangePercent: number;
  lastPrice: number;
  lastQuantity: number;
  bidPrice: number;
  bidQuantity: number;
  askPrice: number;
  askQuantity: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  constructor(payload: ISymbolTickerStreamPayload) {
    this.symbol = String(payload.s); // Symbol
    this.base = String(payload.s.slice(0, -4)); // Base asset
    this.quote = String(payload.s.slice(-4)); // Quote Asset
    this.priceChange = Number(payload.p); // Price change
    this.priceChangePercent = Number(payload.P); // Price change percent
    this.lastPrice = Number(payload.c); // Last price
    this.lastQuantity = Number(payload.Q); // Last quantity
    this.bidPrice = Number(payload.b); // Best bid price
    this.bidQuantity = Number(payload.Q); // Best bid quantity
    this.askPrice = Number(payload.a); // Best ask price
    this.askQuantity = Number(payload.A); // Best ask quantity
    this.openPrice = Number(payload.o); // Open price
    this.highPrice = Number(payload.h); // High price
    this.lowPrice = Number(payload.l); // Low price
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
