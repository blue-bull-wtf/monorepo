import { getDigits, round, truncateTrailingZeroes } from "./maths";
import { dateToDateString, dateToString, dateToTimeString } from "./date";
import { type Callable, isBool, isNumber, isTrue, type Stringifiable } from "./typing";

export function toRaw(s: string): string {
  return s
    .replace(/[^0-9A-Za-zÀ-ÖØ-öø-ÿ-_.,:;\s]+/g, "")
    .toLowerCase()
    .trim();
}

export function slugify(s: string, sep: string = "-"): string {
  // : is kept as part of the slug
  return toRaw(s).replace(/[-_.,;\s]+/gi, sep);
}

export function shortenAddress(
  address: string,
  start = 4,
  end = 4,
  sep = "."
): string {
  const len = address.length;
  return address.slice(0, 2 + start) + sep + address.slice(len - end, len);
}

export const clearFrom = (s: string, regex: string): string =>
  s.substring(0, s.search(new RegExp(regex)));

export const clearNetworkTypeFromSlug = (slug: string): string =>
  clearFrom(slug, "-mainnet|-testnet");

export const stripName = (name: string): string => {
  return name.replace(/\s?(Finance|Protocol|Network|Capital|Exchange|Mainnet|Testnet)\b/g, "");
};

export const stripSlug = (slug: string): string => {
  const base = slug.split("-")[0];
  return base.replace(
    /\s?(testnet|mainnet|finance|protocol|network|capital|exchange|-)\b/g,
    ""
  );
};

export enum Currency {
  USD = "USD",
  EUR = "EUR",
  JPY = "JPY",
  CNY = "CNY",
  GBP = "GBP",
  CHF = "CHF",
  CAD = "CAD",
  AUD = "AUD",
  NZD = "NZD",
  HKD = "HKD",
  SGD = "SGD",
  KRW = "KRW",
  TWD = "TWD",
  BRL = "BRL",
  INR = "INR",
  RUB = "RUB",
  MXN = "MXN",
}

export const SYMBOL_BY_ISO: { [currency: string]: string } = {
  [Currency.USD]: "$",
  [Currency.EUR]: "€",
  [Currency.JPY]: "¥",
  [Currency.CNY]: "¥",
  [Currency.GBP]: "£",
  [Currency.CHF]: "CHF",
  [Currency.CAD]: "C$",
  [Currency.AUD]: "A$",
  [Currency.NZD]: "NZ$",
  [Currency.HKD]: "HK$",
  [Currency.SGD]: "S$",
  [Currency.KRW]: "₩",
  [Currency.TWD]: "NT$",
  [Currency.BRL]: "R$",
  [Currency.INR]: "₹",
  [Currency.RUB]: "₽",
  [Currency.MXN]: "$",
};

export const DEFAULT_VALUE_BY_TYPE: { [k: string]: unknown } = {
  number: 0,
  string: "",
  boolean: false,
  object: {},
};

export const DEFAULT_FORMATTER_BY_TYPE: { [k: string]: Callable<any, string> } =
  {
    number: (v: any) => toFloatAuto(v),
    slug: (v: any) => slugify(v),
    unslug: (v: any) => unslug(v),
    compact: (v: any) => toFloatCompact(v),
    $: (v: any) => toDollarsAuto(v),
    $compact: (v: any) => toDollarsCompact(v),
    percent: (v: any) => toPercent(v),
    string: (v: any) => v.toString(),
    boolean: (v: any) => v,
    object: (v: any) => JSON.stringify(v),
    datetime: (v: any) => dateToString(v),
    date: (v: any) => dateToDateString(v),
    time: (v: any) => dateToTimeString(v),
  };

export function firstNonAlphanum(s: string): string {
  return s.match(/[^\w\s]/)?.[0] ?? "";
}

export function firstSep(s: string): string {
  return s.match(/[,\n\t;| ]/)?.[0] ?? "";
}

export function autoSep(s: Stringifiable): string[] {
  s = s?.toString();
  if (typeof s !== "string") return [];
  const sep = firstSep(s) ?? ",";
  return sep ? s.split(sep) : [s];
}

export function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// borrowed from https://github.com/ethereumjs/ethereumjs-monorepo/util/src/bytes.ts
export function isHexString(value: string, length?: number): boolean {
  if (typeof value !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/))
    return false;
  if (
    typeof length !== "undefined" &&
    length > 0 &&
    value.length !== 2 + 2 * length
  )
    return false;
  return true;
}

export function toUS(n?: number, minDigits = 2, maxDigits = 2): string {
  if (!n) {
    n = 0.0;
  }
  // avoid oveflows
  if (maxDigits < minDigits) maxDigits = minDigits;
  return n.toLocaleString("en-US", {
    maximumFractionDigits: maxDigits,
    minimumFractionDigits: minDigits,
  });
}

export function toSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function toPascal(s: string): string {
  // return s.replace(/[-_\s.]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
  return capitalize(
    s
      .replace(/[^\w\s]|_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
  ).replaceAll(" ", "");
}

export function toCamel(s: string): string {
  s = toPascal(s);
  return s[0].toLowerCase() + s.substring(1);
}

export function unslug(s: string, sep: string = "-"): string {
  return capitalize(toRaw(s).replace(sep, " "));
}

export function add(str: string, targetLength: number, char: string) {
  str.padEnd(targetLength, char);
}

export function bytesToString(
  arr: ArrayBuffer,
  encoding: string = "utf-8"
): string {
  return new TextDecoder(encoding).decode(arr);
}

export function bytesToObject(arr: Uint8Array): any {
  return JSON.parse(bytesToString(arr));
}

export function newlinesToHtml(str: string) {
  return str.replace(/(?:\r\n|\r|\n)/g, "<br>");
}

export function formatDescription(str: string) {
  return str.replace(/(.*?)(\n|$)/g, "<p>$1</p>");
}

export function encodeEmail(
  recipients: string[] = ["tech@bluebull.wtf"], // TODO: move to content
  subject: string,
  body: string,
  cc: string[] = [],
  bcc: string[] = []
): string {
  body = body.trim();
  if (!body.length) return "";
  // let recipients: string[] = recipients.map(r => Config.Email.getAddress(r));
  let s = "mailto:" + recipients.join(",") + "?";
  if (subject) s += "subject=" + encodeURIComponent(subject) + "&";
  if (body) s += "body=" + encodeURIComponent(body.trim()) + "&";
  if (cc.length) s += "cc=" + cc.join(",") + "&";
  if (bcc.length) s += "bcc=" + bcc.join(",") + "&";
  return s.substring(0, s.length - 1);
}

export function emailTo(to: string, subject: string, body: string): string {
  return encodeEmail([to], subject, body);
}

export function capitalize(str: string): string {
  return str.replace(/\b\w/g, (l) => l.toUpperCase());
}

export function hasMinCharCount(s: string, n = 1, trim = true) {
  if (trim) s = s.trim();
  return new Set(s).size >= n;
}

export function hasMaxCharCount(s: string, n = 1, trim = true) {
  return !hasMinCharCount(s, n + 1, trim);
}

export function toPercent(
  n?: number,
  scale = 2, // this should be based on magnitude
  signed = false,
  hidePercentSign = false
): string {
  if (!n) {
    n = 0.0;
  }
  const sign = signed && n > 0 ? "+" : "";
  if (n >= 2) {
    return round(n, scale) + "x";
  }
  return (
    sign +
    ((n * 100).toLocaleString("en-US", {
      maximumFractionDigits: scale,
      minimumFractionDigits: Math.min(scale, 2),
    }) || "00.00") +
    (hidePercentSign ? "" : "%")
  );
}

export function toFloat(
  n?: number,
  signed = true,
  minDigits = 2,
  maxDigits = 2
): string {
  if (!n) {
    n = 0.0;
  }
  const sign = n < 0 ? "-" : signed ? "+" : "";
  return sign + toUS(Math.abs(n), minDigits, maxDigits);
}

export function toDollars(
  n?: number,
  signed = false,
  minDigits = 2,
  maxDigits = 2
): string {
  if (!n) {
    n = 0.0;
  }
  const sign = n < 0 ? "-" : signed ? "+" : "";
  return sign + "$" + toFloat(n, false, minDigits, maxDigits);
}

export function toFloatNoTrailing(
  n?: number,
  signed = true,
  maxDigits = 3
): string {
  return toFloat(n, signed, 0, maxDigits);
}

export function toDollarsNoTrailing(
  n?: number,
  signed = false,
  maxDigits = 3
): string {
  if (!n) {
    n = 0.0;
  }
  const sign = n < 0 ? "-" : signed ? "+" : "";
  return sign + "$" + toFloatNoTrailing(n, false, maxDigits);
}

export const COMPACT_FORMATTER = Intl.NumberFormat("en", {
  notation: "compact",
});

export function toCurrencyCompact(
  n?: number,
  currency = Currency.USD,
  signed = false
): string {
  if (!n) {
    n = 0.0;
  }
  const sign = n < 0 ? "-" : signed ? "+" : "";
  return sign + SYMBOL_BY_ISO[currency] + COMPACT_FORMATTER.format(Math.abs(n));
}

export function toDollarsCompact(n?: number, signed = false): string {
  return toCurrencyCompact(n, Currency.USD, signed);
}

export function toEuroCompact(n?: number, signed = false): string {
  return toCurrencyCompact(n, Currency.EUR, signed);
}

export function toSterlingCompact(n?: number, signed = false): string {
  return toCurrencyCompact(n, Currency.GBP, signed);
}

export function toYenCompact(n?: number, signed = false): string {
  return toCurrencyCompact(n, Currency.JPY, signed);
}

export function toFloatCompact(n?: number, signed = true): string {
  if (!n) {
    n = 0.0;
  }
  const sign = n < 0 ? "-" : signed ? "+" : "";
  return sign + COMPACT_FORMATTER.format(Math.abs(n));
}

export function toFloatAuto(n?: number, signed = true, precision = 4): string {
  if (!n) {
    n = 0.0;
  }
  if (Math.abs(n) > 5_000_000) {
    return toFloatCompact(n, signed);
  } else if (n != 0.0 && Math.abs(n) < 0.001) {
    precision = Math.min(precision, getDigits(n) + 2);
    return round(n, precision).toExponential();
  }
  return toFloat(n, signed, Math.min(2, precision), precision);
}

export function toDollarsAuto(n?: number, signed = false): string {
  return toCurrencyAuto(n, Currency.USD, signed);
}

export function toEuroAuto(n?: number, signed = false): string {
  return toCurrencyAuto(n, Currency.EUR, signed);
}

export function toSterlingAuto(n?: number, signed = false): string {
  return toCurrencyAuto(n, Currency.GBP, signed);
}

export function toYenAuto(n?: number, signed = false): string {
  return toCurrencyAuto(n, Currency.JPY, signed);
}

export const precisionByCurrency: { [currency: string]: number } = {
  [Currency.EUR]: 2,
  [Currency.USD]: 2,
  [Currency.CHF]: 2,
  [Currency.CAD]: 2,
  [Currency.AUD]: 2,
  [Currency.NZD]: 2,
  [Currency.HKD]: 2,
  [Currency.SGD]: 2,
  [Currency.JPY]: 4,
  // TODO: add more when currency change is implemented
};

export function toCurrencyAuto(
  n?: number,
  currency = Currency.USD,
  signed = false,
  precision?: number
): string {
  if (!n) {
    n = 0.0;
  }
  const unsigned = Math.abs(n);
  const sign = n < 0 ? "-" : signed ? "+" : "";
  if (!precision)
    precision =
      unsigned < 0.1
        ? getDigits(unsigned) + 1
        : (unsigned >= 8_000 ? 0 : precisionByCurrency?.[currency]) ?? 4;
  return (
    sign + SYMBOL_BY_ISO[currency] + toFloatAuto(unsigned, false, precision)
  );
}

type timeUnit = "ms" | "s" | "m" | "h" | "d" | "w";

export function toDurationAuto(n?: number, unit: timeUnit = "ms"): string {
  if (!n) {
    return "--";
  }
  const units = ["w", "d", "h", "m", "s", "ms"];
  const divisors: number[] = [604800000, 86400000, 3600000, 60000, 1000, 1];
  let ms = n * divisors[units.indexOf(unit)];

  const vals: number[] = [];
  for (let i = 1; i < units.length - 1; i++) {
    vals.push(Math.floor(ms / divisors[i]));
    ms %= divisors[i];
  }
  const fmt = (v: number) => v.toString().padStart(2, "0");
  const [d, h, m, s] = vals;
  if (d > 0) return `${fmt(d)}:${fmt(h)}:${fmt(m)}:${fmt(s)}`;
  if (h + m > 0) return `${fmt(h)}:${fmt(m)}:${fmt(s)}`;
  if (ms + s < 0) return `--`;
  ms = truncateTrailingZeroes(round(ms, 3));
  return s ? `${s}.${ms}s` : `${ms}ms`;
}

export function splitSearchTokens(searchString: string): string[] {
  // Trim the search string and split by spaces, semicolons, or vertical whitespace, capturing quotes
  return searchString.trim().split(/["']?[\s;\v]+["']?/).filter(Boolean).map(s => 
    s[0] === '"' || s[0] === "'" && s[s.length - 1] === s[0] ? s.slice(1, -1) : s
  );
}

export function parseJwt(token: string): any {
  if (token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      (window?.atob ?? atob)(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  }
}

export const PARSER_BY_TYPE: { [k: string]: Callable<any, any> } = {
  "ObjectId": (v: any) => v?.toString() ?? v,
  "id": (v: any) => v?.toString() ?? v,
  "date": (v: any) => new Date(v),
  "number": (v: any) => Number(v),
  "string": (v: any) => String(v),
  "boolean": (v: any) => isTrue(v),
  "mixed": (v: any) => isNumber(v) ? Number(v) : isBool(v) ? isTrue(v) : v,
  "unknown": (v: any) => isNumber(v) ? Number(v) : isBool(v) ? isTrue(v) : v,
  "object": (v: any) => JSON.parse(v),
  "map": (v: any) => JSON.parse(v),
};
