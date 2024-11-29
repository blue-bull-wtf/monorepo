import { sleep } from "./typing";

export interface IDate {
  year?: number,
  month?: number,
  day?: number,
  hour?: number,
  minute?: number,
  second?: number,
  // milli: number, = .001s
  // nano: number = .000001s
};

export function iso3166toBcp47Locale(iso=process.env.LC_ALL): string {
  if (!iso) return "";
  let [languageCode, regionCode] = iso.split(".")[0].split('_');
  // override docker/containerd's C locale
  if (languageCode.toUpperCase() == "C") {
    languageCode = "en";
    regionCode = "US";
  }
  return `${languageCode}-${regionCode}`;
}

export function getLocale(): string {
  return iso3166toBcp47Locale() // ISO 3166-1
      || process.env.LC_MESSAGES // ISO 3166-1
      || process.env.LANG // ISO 3166-1
      || process.env.LANGUAGE
      || navigator?.language // BCP 47
      || 'en-US';
}

const LOCALE: string = getLocale();

const localDateOptions: any = { day: '2-digit', month: '2-digit', year: '2-digit' };
const localHHMMOptions: any = { hour: '2-digit', minute: '2-digit' }; // hour12: true };
const localHHMMSSOptions: any = { hour: '2-digit', minute: '2-digit', second: '2-digit' }; // hour12: true;

// date only
export function dateToDateString(date: Date, locale=LOCALE): string {
  if (!date) return 'NA';
  // return date.toISOString().slice(0, 10);
  return date.toLocaleDateString(locale, localDateOptions);
}

export function epochToDateString(epoch: number, locale=LOCALE) {
  return dateToDateString(new Date(epoch * 1000), locale);
}

// time only
export function dateToTimeString(date: Date, locale=LOCALE) {
  if (!date) return 'NA';
  return date.toLocaleTimeString(locale); // localTimeOptions
}

export function epochToTimeString(epoch: number, locale=LOCALE) {
  return dateToTimeString(new Date(epoch * 1000), locale);
}

// date + time
export function dateToString(date: Date, locale=LOCALE) {
  // return date.toLocaleString(locale);
  if (!date) return 'NA';
  const options = {
    year: '2-digit', // YY
    month: '2-digit', // MM
    day: '2-digit', // DD1
    hour: '2-digit', // HH
    minute: '2-digit', // MM
    second: '2-digit', // SS
    hour12: false, // 12-hour clock with AM/PM
  } as Intl.DateTimeFormatOptions;
  return new Intl.DateTimeFormat(locale, options).format(date).replace(/,| $/, '');
}

export function epochToString(epoch: number, locale=LOCALE) {
  return dateToString(new Date(epoch * 1000), locale);
}

export function dateToStringShort(date: Date, locale=LOCALE) {
  if (!date) return 'NA';
  const options = {
    // year: '2-digit', // YY
    month: '2-digit', // MM
    day: '2-digit', // DD
    hour: '2-digit', // HH
    minute: '2-digit', // MM
    hour12: false, // 12-hour clock with AM/PM
  } as Intl.DateTimeFormatOptions;
  return new Intl.DateTimeFormat(locale, options).format(date).replace(/,| $/, '');
}

export function epochToStringShort(epoch: number, locale=LOCALE) {
  return dateToStringShort(new Date(epoch * 1000), locale);
}

// export function dateToHHMMSS(date: Date): string {
//   return date.toLocaleTimeString().replace(/:\d+ /, " ");
// }

export function dateToHHMM(date: Date, locale=LOCALE) {
  return date.toLocaleTimeString(locale, localHHMMOptions).replace(/\s/g, '');
}

export function dateToHHMMSS(date: Date, locale=LOCALE) {
  return date.toLocaleDateString(locale, localHHMMSSOptions).replace(/\s/g, '');
}

export function dateToDDMM(date: Date, locale='en-UK'): string {
  // return date.toISOString().slice(0, 10);
  return date.toLocaleDateString(locale).slice(0, 5);
}

export function dateToYYYYMMDD(date: Date, locale='en-UK'): string {
  // return date.toISOString().slice(0, 10).replace(/-/g, "");
  return date.toLocaleDateString(locale).split("/").reverse().join("-");
}

// export function isHoliday(date: Date): boolean {
//     return getYearHolidays(date.getFullYear())[date.getMonth()].includes(date.getDate());
// }

export function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}

export function shiftDate(shift: IDate, d: Date = new Date()): Date {
  if (shift?.year) d.setFullYear(d.getFullYear() + shift.year);
  if (shift?.month) d.setMonth(d.getMonth() + shift.month);
  if (shift?.day) d.setDate(d.getDate() + shift.day);
  if (shift?.hour) d.setHours(d.getHours() + shift.hour);
  if (shift?.minute) d.setMinutes(d.getMinutes() + shift.minute);
  if (shift?.second) d.setSeconds(d.getSeconds() + shift.second);
  return d;
}

export enum TimeFrame {
  S1 = 1,
  S2 = 2,
  S5 = 5,
  S10 = 10,
  S15 = 15,
  S30 = 30,
  M1 = 60,
  M2 = 120,
  M3 = 180,
  M5 = 300,
  M10 = 600,
  M15 = 900,
  M30 = 1800,
  H1 = 3600,
  H2 = 7200,
  H3 = 10800,
  H4 = 14400,
  H6 = 21600,
  H8 = 28800,
  H12 = 43200,
  d1 = 86400,
  d2 = 172800,
  d3 = 259200,
  w1 = 604800,
  w2 = 1209600,
  m1 = 2635200,
  m2 = 5270400,
  m3 = 7905600,
  m6 = 15811200,
  y1 = 31556925,
  y2 = 63113850,
  y3 = 94670776,
  y5 = 157784626,
  y10 = 315569252,
}

export const TIMEFRAMES = <TimeFrame[]>Object.values(TimeFrame).filter(v => !isNaN(<any>v));

export const tfToOptions = (...tfs: TimeFrame[]) => tfs.map(tf => ({ label: binanceTf[tf], value: tf }));

export const binanceTf: { [key: number]: string } = {
  [TimeFrame.M1]: '1m',
  [TimeFrame.M3]: '3m',
  [TimeFrame.M5]: '5m',
  [TimeFrame.M15]: '15m',
  [TimeFrame.M30]: '30m',
  [TimeFrame.H1]: '1h',
  [TimeFrame.H2]: '2h',
  [TimeFrame.H4]: '4h',
  [TimeFrame.H6]: '6h',
  [TimeFrame.H8]: '8h',
  [TimeFrame.H12]: '12h',
  [TimeFrame.d1]: '1d',
  [TimeFrame.d3]: '3d',
  [TimeFrame.w1]: '1w',
  [TimeFrame.m1]: '1M'
}

export const FLOOR_BY_TIMEFRAME_SEC: {[tf: number]: Function} = {
  [TimeFrame.w1]: startOfWeek,
  [TimeFrame.w2]: startOfWeek,
  [TimeFrame.m1]: startOfMonth,
  [TimeFrame.m2]: startOfMonth,
  [TimeFrame.m3]: startOfMonth,
  [TimeFrame.m6]: startOfMonth,
  [TimeFrame.y1]: startOfYear,
  [TimeFrame.y2]: startOfYear,
  [TimeFrame.y3]: startOfYear,
  [TimeFrame.y5]: startOfYear,
  [TimeFrame.y10]: startOfYear,
}

export const CEIL_BY_TIMEFRAME_SEC: {[tf: number]: Function} = {
  [TimeFrame.w1]: endOfWeek,
  [TimeFrame.w2]: endOfWeek,
  [TimeFrame.m1]: endOfMonth,
  [TimeFrame.m2]: endOfMonth,
  [TimeFrame.m3]: endOfMonth,
  [TimeFrame.m6]: endOfMonth,
  [TimeFrame.y1]: endOfYear,
  [TimeFrame.y2]: endOfYear,
  [TimeFrame.y3]: endOfYear,
  [TimeFrame.y5]: endOfYear,
  [TimeFrame.y10]: endOfYear,
}

export function getMsToTimeFrameEnd(tf: TimeFrame): number {
  const tfMs = tf*1000;
  return tfMs - (new Date().getTime() % tfMs);
}

export async function sleepToNextTimeFrame(tf: TimeFrame) {
  await sleep(getMsToTimeFrameEnd(tf));
}

export function startOfDayUtc(d: Date = new Date()): Date {
  d.setUTCHours(0);
  d.setUTCMinutes(0);
  d.setUTCSeconds(0);
  d.setUTCMilliseconds(0);
  return d;
}

export function startOfDay(d: Date = new Date(), utc=true): Date {
  if (utc)
    return startOfDayUtc(d);
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

export function endOfDayUtc(d: Date = new Date()): Date {
  d.setUTCHours(23);
  d.setUTCMinutes(59);
  d.setUTCSeconds(59);
  d.setUTCMilliseconds(999); // be careful with this
  return d;
}

export function endOfDay(d: Date = new Date(), utc=true): Date {
  if (utc)
    return endOfDayUtc(d);
  d.setHours(23);
  d.setMinutes(59);
  d.setSeconds(59);
  d.setMilliseconds(999); // be careful with this
  return d;
}

export function startOfWeek(d: Date = new Date(), utc=true): Date {
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day == 0 ? -6 : 1));
  return startOfDay(d, utc);
}

export function startOfMonth(d: Date = new Date(), utc=true): Date {
  d.setDate(1);
  return startOfDay(d, utc);
}

export function startOfYear(d: Date = new Date(), utc=true): Date {
  d.setMonth(0);
  d.setDate(1);
  return startOfDay(d, utc);
}

export function endOfWeek(d: Date = new Date(), utc=true): Date {
  d = startOfWeek(d);
  d.setDate(d.getDate() + 6);
  return endOfDay(d, utc);
}

export function endOfMonth(d: Date = new Date(), utc=true): Date {
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return endOfDay(d, utc);
}

export function endOfYear(d: Date = new Date(), utc=true): Date {
  d.setFullYear(d.getFullYear() + 1);
  d.setMonth(0);
  d.setDate(0);
  return endOfDay(d, utc);
}

export function delaySecondsToHHMM(seconds: number): string {

  let min: number = Math.floor(Math.abs(seconds) / 60);
  const hour: number = Math.floor(min / 60);
  min -= (hour * 60);
  if (min + hour === 0) { return "none"; }
  return `${seconds < 0 ? "-" : "+"}${hour < 10 ? "0" + hour : hour}:${min < 10 ? "0" + min : min}`;
}

export function dateDiffFromMidnight(d1: Date, dateMidnight: Date): number {
  // let secOfDay = (1000 * 60 * 60 * 24);
  dateMidnight.setHours(0, 0, 0, 0);
  return d1.getTime() - dateMidnight.getTime();
  // let diffDays = secDifference % secOfDay;
}

export function dateToEpoch(date: Date): number {
  return Math.round(date.getTime());
}

export function dateDiffMs(d1: Date, d2: Date): number {
  return d1.getTime() - d2.getTime();
}

export function diffMsAsDays(ms: number): number {
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export function getEpochRange(dateStart: Date, dateStop: Date, tf: TimeFrame): number[] {
  const range = [];
  const [epochStart, epochStop] = [dateToEpoch(dateStart), dateToEpoch(dateStop)];
  let rangeStart = ceilEpoch(epochStart, tf);
  while (rangeStart < epochStop) {
    range.push(rangeStart += tf * 1000);
  }
  return range;
}

export function fitTimeFrameToDateRange(dateStart: Date, dateStop: Date, targetEpochs?: number): TimeFrame {
  return fitTimeFrameToEpochRange(dateToEpoch(dateStart), dateToEpoch(dateStop), targetEpochs);
}

// used to define the best resampling timeFrame for given epochs
export function fitTimeFrameToEpochRange(dateStart: number, dateStop: number, targetEpochs?: number): TimeFrame {

  if (targetEpochs) {
    const rangeSec = (dateStop - dateStart) / 1000;
    return roundTimeFrame(rangeSec / targetEpochs);
  }

  let diff = (dateStop - dateStart) / (1000 * 60 * 60);
  if (diff < 4) {
    return TimeFrame.M1;
  } else if (diff < 24) {
    return TimeFrame.M5;
  }
  diff /= 24;
  if (diff < 7) {
    return TimeFrame.M30;
  } else if (diff < 30) {
    return TimeFrame.H2;
  } else if (diff < 180) {
    return TimeFrame.H12;
  } else if (diff < 365) {
    return TimeFrame.d1;
  } else if (diff < 1095) {
    return TimeFrame.d3;
  }
  return TimeFrame.w1;
}

export function roundTimeFrame(secs: number, margin=.25, tfs=TIMEFRAMES): TimeFrame {
  for (let tf of tfs) {
    if (tf >= secs*(1-margin))
      return tf;
  }
  console.warn("tf not found for secs: " + secs);
  return TimeFrame.H1;
}

export function ceilTimeFrame(secs: number, tfs=TIMEFRAMES): TimeFrame {
  return roundTimeFrame(secs, 0, tfs);
}

// FIXME: bad method
export function floorTimeFrame(secs: number, tfs=TIMEFRAMES): TimeFrame {
  return roundTimeFrame(secs, .1, tfs);
}

export function floorEpoch(epoch: number, tf: TimeFrame, utc=true): number {
  if (tf < TimeFrame.w1) {
    return epoch - (epoch % (tf * 1000));
  } else {
    return dateToEpoch(FLOOR_BY_TIMEFRAME_SEC[tf](new Date(epoch), utc));
  }
}

export function ceilEpoch(epoch: number, tf: TimeFrame, utc=true): number {
  if (tf < TimeFrame.w1) {
    return floorEpoch(epoch, tf, utc) + tf * 1000;
  } else {
    return dateToEpoch(CEIL_BY_TIMEFRAME_SEC[tf](new Date(epoch), utc)) + 1; // ceil returns 999ms, we round it up
  };
}
