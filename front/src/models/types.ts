import { Transaction } from "ethers";
import { ResCode } from "../../../common/utils/http-responses";
import { ActionByName, Callable, Stringifiable } from "../../../common/utils/typing";
import { ContentType, FieldType, HTTPMethod, LogLevel, ResponseType, TokenBearing, XPos, YPos } from "./enums";
import { DefineComponent, Ref } from "vue";

export interface ILog {
  id?: string;
  icon?: string;
  type?: LogLevel;
  message?: string;
  err?: string;
  date?: Date;
  trace?: string[];
  txHash?: string;
  notified?: boolean;
  getTransaction?(): Transaction;
  remove?(): void;
}

export interface ISlugged {
  slug?: string;
  name?: string;
}

export type AppRoute = {
  title: string,
  component?: () => Promise<{ default: any }>,
  props?: Record<string, any>
}

export type NavRoute = {
  title: string,
  path?: string,
  icon?: string,
  children?: NavRoute[]
}

export interface ILottie {
  src?: string|any|ArrayBuffer;
  container?: HTMLElement;
  renderer?: 'svg' | 'canvas' | 'html';
  rendererSettings?: any;
  width?: number;
  height?: number;
  autoplay?: boolean;
  loop?: boolean;
  speed?: number;
  play?(): void;
  pause?(): void;
  stop?(): void;
}

export interface IHttpMessage {
  uri?: string,
  method?: HTTPMethod,
  headers?: {[key: string]: any},
  status?: ResCode,
  body?: string|any,
  queryParams?: {[key: string]: any},
  ping?: number, // ms
  date?: number
}

export interface IHttpRequest {
  url: string; // request endpoint
  method?: HTTPMethod,
  contentType?: ContentType;
  headers?: { [key: string]: any }; // map of headers
  tokenBearing?: TokenBearing;
  token?: string;
  queryString?: string; // querystring already put together
  queryParameters?: { [key: string]: any }; // query parameters as keys & values
  body?: any;
  responseType?: ResponseType; // XMLHttpRequestResponseType;
  async?: boolean;
  onprogress?: (payload: IHttpMessage|ProgressEvent) => any;
  onload?: (payload: IHttpMessage|ProgressEvent) => any;
  onredirect?: (payload: IHttpMessage|ProgressEvent) => any;
  oninformation?: (payload: IHttpMessage|ProgressEvent) => any;
  onsuccess?: (payload: IHttpMessage|ProgressEvent) => any;
  onerror?: (payload: IHttpMessage|ProgressEvent) => any;
}

export interface IBlockInfo {
  extraData: string;
  baseFeePerGas?: number;
  gasLimit: number;
  gasUsed: number;
  hash: string;
  logsBloom?: string;
  miner: string;
  nonce: string;
  number: number;
  parentHash: string;
  receiptRoot?: string;
  sha3Uncles?: string;
  size?: number;
  stateRoot?: string;
  timestamp: number;
  difficulty: number;
  totalDifficulty?: number;
  transactions: string[];
  transactionsRoot?: string;
  uncles?: string[];
}

export interface IGasHistoryResponse {
  oldestBlock: number;
  reward: number[][];
  baseFeePerGas: string[];
  gasUsedRatio: number[];
}

export interface IGasHistoryFormatted {
  number: number;
  baseFeePerGas: number;
  gasUsedRatio: number;
  priorityFeePerGas: number[];
}

export interface IDescriptionSlide {
  title?: string;
  icon?: string;
  body: string;
  links?: NavRoute[];
}


export namespace Req {
  export interface INetworkCurrency {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: number; // 18 by default
  }

  export interface INetwork {
    chainId: string; // A 0x-prefixed hexadecimal string
    chainName: string;
    nativeCurrency: INetworkCurrency;
    rpcUrls: string[];
    blockExplorerUrls?: string[];
    iconUrls?: string[]; // Currently ignored.
  }

  export interface IWatchAsset {
    type: 'ERC20'; // In the future, other standards will be supported
    options: {
      address: string; // The address of the token contract
      symbol: string; // A ticker symbol or shorthand, up to 5 characters
      decimals: number; // The number of token decimals
      image: string; // A string url of the token logo
    };
  }
}

export type ITableCellType =
  | 'string'
  | 'number'
  | 'percent'
  | 'compact'
  | '$'
  | '$compact'
  | 'percent'
  | 'boolean'
  | 'date'
  | 'object'
  | 'link'
  | 'html'
  | 'image';

export type ITableCellValue =
  | string
  | number
  | boolean
  | unknown
  | String
  | Number
  | Boolean
  | Date
  | Object
  | ITableLink;
//type ITableCellType = String | Number | Boolean | Date | Object | ITableLink;

export interface ITableLink extends RelativeIndexable<string> {
  href: string;
  target?: '_blank' | '_self' | '_parent' | '_top' | 'framename';
  text?: string;
}

export interface IColumn {
  values: any[];
  name?: string;
  type?: ITableCellType;
  formatter?: Callable;
  classes?: string[];
}

// sort function
export interface Sort {
  column?: number; // index
  direction?: number;
  criteria?: Callable<number>; // ((val: any) => boolean)[];
  mask: number[]; // sorted index
  get: (row: number) => any;
}

export interface ITable {
  name?: string;
  orientation?: 'column' | 'row';
  columns?: IColumn[];
  rows?: Array<ITableCellValue | ITableCellValue[]>;
  keys?: string[]; // 1 per column
  headers: string[]; // 1 per column
  types?: ITableCellType[]; // 1 per column
  sort?: Sort; // 1 per column
  formatters?: (Callable | undefined)[]; // 1 per column
  widths?: number[]; // 1 per column
}

export type Column = any; // multiple implementations
// | IntColum
// | UintColumn
// | LongColumn
// | UlongColumn
// | FloatColumn
// | DoubleColumn
// | StringColumn

export interface IStorage {
  set: (key: Stringifiable, value: any) => void;
  get: (key: Stringifiable) => any;
  flush: (key: string) => void;
  refuse: (key: string) => void;
  accept: (key: string) => void;
  refuseForever: (key: string) => void;
  acceptForever: (key: string) => void;
  check: (key: string) => any;
  sign: (key: string, message: string) => Promise<boolean>;
}

export interface IPickerOption<T=any> {
  value: T, 
  label: string,
  icons?: string[]
}

export interface IPromptContent {
  type?: FieldType;
  title?: string;
  innerHtml?: string;
  modalComponent?: DefineComponent<{}, {}, any>; //<typeof Modal>;
  modalComponentProps?: Object;
  in?: any;
  out?: Ref<any>;
  primaryCallbacks?: ActionByName;
  secondaryCallbacks?: ActionByName;
}

export interface IModal {
  id?: string;
  title?: string;
  icon?: string;
  componentModule?: any;
  closable?: boolean;
  bordered?: boolean;
  classes?: string;
  spawnParent?: HTMLElement;
  [prop: string]: any;
}

export interface IPrompt extends IPromptContent, IModal {
}

export interface IToast extends ILog {
  actions?: ActionByName;
  closable?: boolean;
  autoClose?: boolean;
  autoCloseSeconds?: number;
  delaySeconds?: number;
  yPos?: YPos;
  xPos?: XPos;
  classes?: string[];
}

export interface IFeed {
  type: string;
  fields: Record<string, string>;
  cached: boolean;
  streamed: boolean;
}

export interface ITicker {
  symbol: string;
  feeds: Set<string>;
  vwap: number;
  prices: Record<string, number>; // by feed
}
