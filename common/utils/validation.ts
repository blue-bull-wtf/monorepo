import { type Callable } from "./typing";

export const URL_RE = /(\b(https?|s?ftp|wss?|file|mailto|phoneto):\/\/)[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;
export const TWITTER_RE = /http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/;
export const DISCORD_RE = /^https?:\/\/(?:www\.)?discord(?:app)?.(?:gg|com\/invite)\/([a-zA-Z0-9-]+)/; // invite
export const TELEGRAM_RE = /^https?:\/\/(?:www\.)?(?:t(?:elegram)?\.me|telegram\.org\/joinchat)\/([a-zA-Z0-9_-]+)/; // invite
export const REDDIT_RE = /^https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/([a-zA-Z0-9_-]+)\/[a-zA-Z0-9_-]+/;
export const YOUTUBE_RE = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
export const EMAIL_RE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const PHONE_RE = /^((?:9[679]|8[035789]|6[789]|5[90]|42|3[578]|2[1-689])|9[0-58]|8[1246]|6[0-6]|5[1-8]|4[013-9]|3[0-469]|2[70]|7|1)(?:\W*\d){0,13}\d$/;
export const IMAGE_URL_RE = /^https?:\/\/.*\.(png|jpeg|jpg|gif|webp)$/i;
export const IMAGE_B64_RE = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/i;
export const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/i;
export const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
export const MD5_RE = /^[a-fA-F0-9]{32}$/;
export const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ\-\s']+$/; // could use ^[\pL\pM\p{Zs}.-]+$, but only compatible with xregexp
export const USER_NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\-_]+$/; // could use ^[\pL\pM\p{Zs}.-]+$, but only compatible with xregexp
export const ADDRESS_RE = /^(\d+) [a-zA-Z0-9\s]+(\.)? [a-zA-Z]+(,)? [A-Z]{2} [0-9]{5,6}$/;
export const HAS_UPPER_RE = /[A-Z]/;
export const HAS_LOWER_RE = /[a-z]/;
export const HAS_NUMBERS_RE = /\d/;
export const HAS_NON_ALPHA_RE = /\W/;
export const SLUG_RE = /^[0-9a-zA-Z\u00E0-\u00FC:\-]+$/i;
export const SLUGS_CSV_RE = /^[0-9a-z\u00E0-\u00FC:\-,;]+$/i;

export namespace is {
    export const empty = (s: string) => !s?.trim?.();
    export const url = (s: string) => !empty(s) && URL_RE.test(s); // could use try { new URL(s); } catch { return false; } return true;
    export const twitter = (s: string) => !empty(s) && TWITTER_RE.test(s);
    export const discord = (s: string) => !empty(s) && DISCORD_RE.test(s);
    export const telegram = (s: string) => !empty(s) && TELEGRAM_RE.test(s);
    export const youtube = (s: string) => !empty(s) && YOUTUBE_RE.test(s);
    export const reddit = (s: string) => !empty(s) && REDDIT_RE.test(s);
    export const name = (s: string) => !empty(s) && NAME_RE.test(s);
    export const email = (s: string) => !empty(s) && EMAIL_RE.test(s);
    export const pass = (s: string) => !empty(s) && s.length > 8 && HAS_UPPER_RE.test(s) && HAS_LOWER_RE.test(s) && HAS_NUMBERS_RE.test(s);
    export const phone = (s: string) => !empty(s) && PHONE_RE.test(s);
    export const postalAddress = (s: string) => !empty(s) && ADDRESS_RE.test(s);
    export const username = (s: string) => !empty(s) && USER_NAME_RE.test(s);
    export const identifier = (s: string) => !empty(s) && (email(s) || username(s));
    export const evmAddress = (s: string) => !empty(s) && EVM_ADDRESS_RE.test(s);
    export const md5 = (s: string) => !empty(s) && MD5_RE.test(s);
    export const slug = (s: string) => !empty(s) && SLUG_RE.test(s);
    export const id = (s: string) => !empty(s) && (slug(s) || evmAddress(s));
    export const slugsCsv = (s: string) => !empty(s) && SLUGS_CSV_RE.test(s);
    export const imageUrl = (s: string) => !empty(s) && (IMAGE_URL_RE.test(s));
    export const base64Image = (s: string) => !empty(s) && (IMAGE_B64_RE.test(s));
    export const image = (s: string) => !empty(s) && (imageUrl(s) || base64Image(s));
    export const hexColor = (s: string) => !empty(s) && HEX_COLOR_RE.test(s);
    export const match = (s1: string, s2: string) => s1 == s2;
}

export function validate(checker: Callable<boolean>, ...s: string[]): string {
    const ok = !s.map(_s => checker(_s)).includes(false);
    return ok ? "" : checker.name ? `${checker.name} invalid` : `validation failed`;
}

export const validateMatch = (s1: string, s2: string): string => is.match(s1, s2) ? "" : "entries don't match";

export function validatePass(s: string): string {
    if (is.empty(s)) return "empty password";
    if (s.length < 8) { return "at least 8 characters expected"; }
    if (!HAS_UPPER_RE.test(s)) { return "at least 1 upper case expected"; }
    if (!HAS_LOWER_RE.test(s)) { return "at least 1 lower case expected"; }
    if (!HAS_NUMBERS_RE.test(s)) { return "at least 1 numbers expected"; }
    return "";
}

export function validateAmount(entry: string|number, min: number = 1e-6, max: number = 1e18): string {
    // @ts-ignore
    if (entry == "" || isNaN(entry)) return "not a number";
    const x = typeof entry == 'number' ? entry : Number.parseFloat(entry);
    if (x < min) return `minimum amount expected: ${min}`;
    if (x > max) return `maximum amount expected: ${max}`;
    return "";
}
