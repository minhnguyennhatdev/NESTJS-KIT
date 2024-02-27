/**
 * @param ms : millisecond
 * @returns : await during ms
 */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const capitalizeFirstLetter = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

// capitalize first letter that separate by space or "-" or "_"
export const capitalize = (string: string) =>
  string
    ?.split(/[\s-_]+/)
    .map((word) => capitalizeFirstLetter(word))
    .join(' ');

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
  }
}
String.prototype.replaceLast = function (what: string, replacement: string) {
  const pcs = this.split(what);
  const lastPc = pcs.pop();
  return pcs.join(what) + replacement + lastPc;
};
