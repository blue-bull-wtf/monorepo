export function minmax(data: number[]): [min: number, max: number] {
  let [min, max] = [Number.MAX_VALUE, Number.MIN_VALUE];

  for (const i in data) {
    if (data[i] < min) min = data[i];
    if (data[i] > max) max = data[i];
  }
  return [min, max];
}

export function min(data: number[]): number {
  let min = Number.MAX_VALUE;
  for (const i in data)
    if (data[i] < min)
      min = data[i];
  return min;
}

export function max(data: number[]): number {
  let max = Number.MIN_VALUE;
  for (const i in data)
    if (data[i] > max)
      max = data[i];
  return max;
}

export const calcPercent = (partialValue: number, totalValue: number): number => {
  if (totalValue === 0) return 0;
  return ((100 * partialValue) / totalValue);
}

// TODO: use FloatingPoint arithmetic for better precision
export function round(n?: number, scale = 5): number {
  if (!n)
    return 0.00;
  const divider = Math.pow(10, scale);
  return Math.round((n + Number.EPSILON) * divider) / divider;
}

export function roundAutoPrecision(n?: number): number {
  if (!n)
    return 0.00;
  return round(n, precision(n));
}

// TODO: same as above
export function ceil(n: number, scale: number): number {
  const divider = Math.pow(10, scale);
  return Math.ceil((n + Number.EPSILON) * divider) / divider;
}

// TODO: same as above
export function floor(n: number, scale: number): number {
  const divider = Math.pow(10, scale);
  return Math.floor((n + Number.EPSILON) * divider) / divider;
}

export function truncateTrailingZeroes(n: number) {
  while (n % 10 === 0 && n !== 0)
    n /= 10;
  return n;
}

// NB: more efficient than n.toString().length
export function getDigits(x: number): number {
  return (Math.log10((x ^ (x >> 31)) - (x >> 31)) | 0) + 1;
}

export function getTrailingZeros(s: string): number {
  let n = 0;
  while (s.charAt(s.length - n - 1) == '0')
    n++;
  return n;
}

export function getScale(n: number, precision = 16): number {
  const digits = Math.round(n).toString().length;
  // const s = n.toPrecision(digits-precision);
  const roundingScale = Math.max(precision - digits, 1);
  const s = round(n, roundingScale).toFixed(roundingScale);
  const floatIndex = s.indexOf('.') + 1;
  return floatIndex > 0 ? (s.length - floatIndex - getTrailingZeros(s)) : 0;
}

// this function helps determine automatically a rounding point for charts and all purposes
// eg:
// 0.xxx -> 0.1
// 0.0xx -> 0.01
// 0.00xx -> 0.001
// x.xxx -> 1
// xx.xxx -> 10
// TODO: simplify
export function getMagnitude(n: number): number {
  n = Math.abs(n);
  if (n >= 1) {
    return Math.pow(10, Math.round(n).toLocaleString('fullwide', { useGrouping: false }).length - 1);
  } else {
    return 1 / Math.pow(10, (n.toFixed(16).split('.')?.[1]?.match(/^0*/)?.[0].length || 0) + 1);
  }
}

const roundingAddonByMagnitude: { [magnitude: number]: number } = {
  0.01: 3,
  0.1: 3,
  1: 4,
  10: 3,
  100: 3,
  1000: 2,
  10000: 1,
  100000: 1,
  1000000: 1,
  10000000: 1,
  100000000: 1,
  1000000000: 1,
  10000000000: 1,
  100000000000: 1,
  1000000000000: 1,
  10000000000000: 0,
  100000000000000: 0,
  1000000000000000: 0,
  10000000000000000: 0,
  100000000000000000: 0,
  1000000000000000000: 0,
  10000000000000000000: 0,
  100000000000000000000: 0,
  1000000000000000000000: 0,
  10000000000000000000000: 0,
  100000000000000000000000: 0,
}

export function precision(n: number): number {
  const m = getMagnitude(n);
  return getScale(m) + (roundingAddonByMagnitude?.[m] || 2);
}

export const average = (arr: number[]) => {
  if (arr.length === 0) return 0;
  return Math.round(arr.reduce((a, v) => a + v) / arr.length);
}

export function shuffleArray(arr: Array<unknown>): Array<unknown> {
  return arr.sort(() => Math.random() - 0.5);
}

export function randomDrawNoReplace(min: number, max: number, n: number): number[] {
  const size = max - min;
  const arr = [...Array(size).keys()];
  const shuffled = shuffleArray(arr) as number[];
  return shuffled.slice(0, n).map((x: number) => x + min) as number[];
}

export function normalRand(min: number, max: number, skew = 1): number {
  let r;
  do {
    const u = Math.random();
    const v = Math.random();
    r = Math.sqrt(-2 * Math.log(u || 1e-8)) * Math.cos(2 * Math.PI * v);
    r = Math.pow((r + 3) / 6, skew) * (max - min) + min;
  } while (r < min || r > max);
  return r;
};

export function cap(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
