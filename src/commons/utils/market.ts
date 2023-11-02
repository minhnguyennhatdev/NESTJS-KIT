import { USDT_VNDC_CENTER_RATE } from '@commons/constants';
import { CURRENCIES, ASSETS } from '@commons/constants/currencies';
import { Exception } from '@commons/constants/exception';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import axios from 'axios';

// "ap": 0,
// "bp": 0,
// "p": "24221",
// "ld": 24240,
// "h": 24335,
// "l": 24193,
// "hh": 24310,
// "lh": 24215,
// "vb": 6134.189950861112,
// "vq": 149004069.1350258,
// "s": "USDTVNDC",
// "qi": 72,
// "bi": 22,
// "b": "USDT",
// "q": "VNDC",
// "vc": 0,
// "lbl": "top_view",
// "ph": 24215,
// "u": false,
// "lq": 30.3124,
// "lQ": 734196.6404,
// "t": 1694591254832,
// "av": 6948.987994299854,
// "p3m": 23477,
// "py": 24199,
// "hy": 25946,
// "ly": 19807,
// "pw": 24255,
// "p1m": 23867
interface MarketPrice {
  b: string;
  p: string; // price
  ld: number;
  h: number;
  l: number;
  vb: number;
  vq: number;
  s: string;
  qi: number;
  bi: number;
  q: string;
  u: boolean;
  lq: number;
  lQ: number;
  t: number;
  ph: number;
  hh: number;
  lh: number;
  av: number;
  hy: number;
  ly: number;
  pw: number;
  p1m: number;
  p3m: number;
  py: number;
}

export const getMarketPriceHttp = async (symbol: string) => {
  symbol = symbol.toUpperCase();
  if (symbol.endsWith('VNST')) {
    symbol = symbol.replace('VNST', 'VNDC');
  }
  if (!symbol?.endsWith('VNDC') && !symbol?.endsWith('USDT')) {
    throw new BadRequestException(Exception.INVALID(symbol));
  }
  const {
    data: { data },
  } = await axios.get<{
    data: MarketPrice[];
  }>(`https://nami.exchange/api/v3/spot/market_watch?symbol=${symbol}`);
  if (!data?.[0]) {
    throw new NotFoundException(Exception.NOT_FOUND(`${symbol} market price`));
  }
  return {
    ...data?.[0],
    p: Number(data?.[0]?.p),
    h: Number(data?.[0]?.h),
    l: Number(data?.[0]?.l),
  };
};

export const convertBetweenUSDTandVNDC = (
  value: number,
  from: number | string,
  to: number | string,
  usdtVndcRate = USDT_VNDC_CENTER_RATE.USDT_VNDC_RATE,
) => {
  from = String(from).endsWith('VNST')
    ? String(from).replaceLast('VNST', 'VNDC')
    : from;
  to = String(to).endsWith('VNST')
    ? String(to).replaceLast('VNST', 'VNDC')
    : to;

  if (
    ![from, to].every((e: any) =>
      [
        CURRENCIES.VNST,
        CURRENCIES.VNDC,
        CURRENCIES.USDT,
        ASSETS[CURRENCIES.VNDC],
        ASSETS[CURRENCIES.VNST],
        ASSETS[CURRENCIES.USDT],
      ].includes(e),
    )
  ) {
    return null;
  }

  if ([from, CURRENCIES[from], ASSETS[from]].includes(to)) {
    return value;
  }

  if (to === CURRENCIES.USDT || to === ASSETS[CURRENCIES.USDT]) {
    return value / usdtVndcRate;
  }

  return value * usdtVndcRate;
};
