import Big from 'big.js';

const noteCases = [
  '^BALANCE: Swap future order (\\d+)$',
  '^BALANCE: Place future order (\\d+) fee$',
  '^BALANCE: Close future order (\\d+) fee$',
  '^BALANCE: Close future order (\\d+) raw profit$',
  '^BALANCE: Close pending future order (\\d+) return fee$',
  '^BALANCE: Liquidate active position (\\d+) liquidate fee$',
  '^BALANCE: Liquidate active position (\\d+) close fee$',
  '^BALANCE: Liquidate active position (\\d+) raw profit$',
  '^BALANCE: Close future order (\\d+) swap fee$',
  '^BALANCE: Future order (\\d+) funding fee$',
];

export const getOrderIdFromNote = (note) => {
  const regex = noteCases.map((e) => new RegExp(e)).find((r) => r.test(note));
  if (!regex) return;
  return note.replace(regex, '$1');
};

export const getNumberOfDaysBetweenFromTo = (from: number, to: number) => {
  if (!from || !to) {
    return 0;
  }
  const difference = to - from;
  // Convert milliseconds to days
  const millisecondsInDay = 1000 * 60 * 60 * 24;
  const numDays = Math.floor(difference / millisecondsInDay);
  return numDays;
};

/**
 * @param ms : millisecond
 * @returns : await during ms
 */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const capitalizeFirstLetter = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

export const removeSpecialCharacters = (string: string) =>
  string.replace(/[^\w\s]/g, '');

export const isEmptyValue = (input: any) => {
  return (
    (!input && input !== false && input !== 0) ||
    (typeof input === 'string' && /^\s+$/.test(input)) ||
    (input instanceof Object && !Object.keys(input).length) ||
    (Array.isArray(input) && !input.length)
  );
};

export const removeEmptyValue = (obj: any) => {
  if (!(obj instanceof Object)) return {};
  Object.keys(obj).forEach((key) => isEmptyValue(obj[key]) && delete obj[key]);
  return obj;
};

export const safeJSONParse = (_key, val) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch (e) {}
  }
  return val;
};

export const stringifyKeyValuePair = ([key, value]) => {
  const valueString = Array.isArray(value) ? `["${value.join('","')}"]` : value;
  return `${key}=${encodeURIComponent(valueString)}`;
};

export const buildQueryString = (params: object) => {
  if (!params) return '';
  return Object.entries(params).map(stringifyKeyValuePair).join('&');
};

declare global {
  interface String {
    replaceLast(what: string, replacement: string): string;
    replaceAll(what: string, replacement: string): string;
  }
}
String.prototype.replaceLast = function (what: string, replacement: string) {
  const pcs = this.split(what);
  const lastPc = pcs.pop();
  return pcs.join(what) + replacement + lastPc;
};

export function roundDownNumber(number: number, digits: number) {
  return Number(Big(number).round(digits ?? 0, Big.roundDown));
}

export function parseRedisUri(url: string) {
  const redisUrl = new URL(url);
  return {
    host: redisUrl.hostname,
    port: Number(redisUrl.port),
    password: redisUrl.password,
    db: Number(redisUrl.pathname.split('/')[1]),
  };
}
