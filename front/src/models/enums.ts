// charting / dom
export enum YPos {
  TOP = "top",
  BOT = "bottom",
}

export enum XPos {
  LEFT = "left",
  RIGHT = "right",
  CENTER = "center", // always used for toasts
}

export enum PositionType {
  OUTSIDE = "outside",
  INSIDE = "inside",
  CENTER = "center",
  LEFT = "left",
  RIGHT = "right",
}

export enum AlignType {
  EDGE = "edge",
  LABEL = "labelLine",
  NONE = "none",
}

// web2 generic enums
export enum Severity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  FATAL = 'fatal',
}

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  HEAD = 'HEAD',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  UPDATE = PATCH,
  OPTIONS = 'OPTIONS',
}

export enum ContentType {
  JSON = 'application/json',
  XML = 'application/xml',
  HTML = 'text/html',
  CSV = 'text/csv',
  BYTES = 'application/octet-stream',
  ZIP = 'application/zip',
  TEXT = 'text/plain',
  PROTO = BYTES,
}

export const MIME_TYPE_BY_EXTENSION: { [key: string]: ContentType } = {
  json: ContentType.JSON,
  xml: ContentType.XML,
  html: ContentType.HTML,
  csv: ContentType.CSV,
  zip: ContentType.ZIP,
  txt: ContentType.TEXT,
  proto: ContentType.PROTO,
}

export enum ResponseType {
  JSON = 'json',
  HTML = 'document',
  XML = 'document',
  BYTES = 'arraybuffer', // or blob >> arraybuffer = js
  TEXT = 'text',
  PROTO = BYTES,
}

export enum ResponseStatus {
  NONE = 0,
  INFO = 1,
  SUCCESS = 2,
  REDIRECT = 3,
  CLIENT_ERROR = 4,
  SERVER_ERROR = 5,
}

export enum TokenBearing {
  NONE = 0,
  HEADER = 1,
  QUERY = 2,
  BODY = 3,
}

// TODO v2: review exhaustive list + compatibility with all web3 providers
export enum RpcMethod {
  // Context methods
  GET_WEB3_CLIENTVERSION = 'web3_clientVersion',
  GET_WEB3_SHA3 = 'web3_sha3',
  GET_NET_VERSION = 'net_version',
  GET_NET_PEERCOUNT = 'net_peerCount',
  GET_NET_LISTENING = 'net_listening',
  GET_ETH_PROTOCOLVERSION = 'eth_protocolVersion',
  GET_ETH_SYNCING = 'eth_syncing',
  GET_ETH_MINING = 'eth_mining',
  GET_ETH_HASHRATE = 'eth_hashrate',
  GET_GAS_PRICE = 'eth_gasPrice',
  GET_FEE_HISTORY = 'eth_feeHistory',
  GET_MAX_PRIORITY_FEE = 'eth_maxPriorityFeePerGas',
  ESTIMATE_GAS = 'eth_estimateGas',
  GET_BLOCK_NUMBER = 'eth_blockNumber',
  GET_BLOCK_BY_NUMBER = 'eth_getBlockByNumber',
  GET_BLOCK_TRANSACTION_COUNT_BY_HASH = 'eth_getBlockTransactionCountByHash',
  GET_BLOCK_TRANSACTION_COUNT_BY_NUMBER = 'eth_getBlockTransactionCountByNumber',
  GET_BLOCK_BY_HASH = 'eth_getBlockByHash',
  GET_TRANSACTION_COUNT = 'eth_getTransactionCount',

  // Restricted methods
  REQUEST_ACCOUNTS = 'eth_requestAccounts',
  // Unrestricted methods
  DECRYPT = 'eth_decrypt',
  GET_PUBKEY_ENCRYPTION = 'eth_getEncryptionPublicKey',
  GET_ACCOUNTS = 'eth_accounts',
  CALL = 'eth_call',
  GET_BALANCE = 'eth_getbalance',
  SEND_TX = 'eth_sendTransaction',
  SEND_RAW_TX = 'eth_sendRawTransaction', // not on metamask ?
  SIGN = 'eth_sign',
  PERSONAL_SIGN = 'personal_sign',
  SIGN_TYPED = 'eth_signTypedData', // not on metamask ?
  SIGN_TX = 'eth_signTransaction', // not on metamask ?
  SUBSCRIBE = 'eth_subscribe',
  UNSUBSCRIBE = 'eth_unsubscribe',
  CREATE_ACCESS_LIST = 'eth_createAccessList',

  // misc
  PING = 'ping',

  // wallet methods
  GET_PERMISSION = 'wallet_getPermissions',
  REQUEST_PERMISSION = 'wallet_requestPermissions',
  ADD_NETWORK = 'wallet_addEthereumChain',
  SWITCH_NETWORK = 'wallet_switchEthereumChain',
  REGISTER_ONBOARDING = 'wallet_registerOnboarding',
  WATCH_ASSET = 'wallet_watchAsset',
  // Mobile Specific RPC Methods
  SCAN_QR_CODE = 'wallet_scanQRCode',
}

export enum ReqError {
  // EIP 1193 >> user rejection
  REJECTED_BY_USER = 4001,
  UNAUTHORIZED_BY_USER = 4100,
  METHOD_NOT_SUPPORTED_BY_PROVIDER = 4200,
  PROVIDER_DISCONNECTED = 4900, // disconnected from all networks
  PROVIDER_DISCONNECTED_FROM_NETWORK = 4901, // from single network
  NETWORK_UNKNOWN_BY_PROVIDER = 4902, // from single network
  // JSON RPC 2.0 >> protocol rejection
  INVALID_PAYLOAD = -32700,
  INVALID_REQUEST = -32600,
  INVALID_METHOD = -32601,
  INVALID_PARAMETER = -32602,
  INTERNAL_ERROR = -32603,
  // EIP 1474 >> blockchain rejection
  INVALID_INPUT = -32000,
  RESOURCE_NOT_FOUND = -32001,
  RESOURCE_UNAVAILABLE = -32002,
  TRANSACTION_REJECTED = -32003,
  METHOD_NOT_SUPPORTED = -32004,
  LIMIT_EXCEEDED = -32005,
}

export enum ActivityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  IN_PROGRESS = 'in progress',
  // job/pipeline status
  SUCCESS = 'success',
  FAILURE = 'failure',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum NetworkStatus {
  UP_CLEAR = 'up',
  UP_CONGESTED = 'congested',
  DOWN = 'down',
}

export enum LogLevel {
  DEBUG = "debug",
  SUCCESS = "success",
  INFO = "info",
  NOTICE = "notice",
  WARNING = "warning",
  ERROR = "error",
}

export enum FieldType {

  // single input
  TEXT = "text",
  EMAIL = "email",
  PASSWORD = "password",
  URL = "url",
  TEL = "tel",
  NUMBER = "number",
  DATE = "date",
  COLOR = "color",
  FILE = "file",
  // multiline input
  TEXTAREA = "textarea",
  // toggle
  CHECKBOX = "checkbox",
  RADIO = "radio",
  SWITCH = "switch",
  // slider
  SLIDER = "slider",
  // select
  MULTI_CONTROL = "multi-control",
  SELECT = "select",
  SELECT_DROPDOWN = "dropdown"
}
