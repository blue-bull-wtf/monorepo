import { apis } from "../constants";
import { HTTPMethod, ContentType, TokenBearing, ResponseStatus, ResponseType } from "../models/enums";
import { IHttpMessage, IHttpRequest } from "../models/types";
import { session } from "../store";
import { ResCode } from "../../../common/utils/http-responses";
import { merge } from "../../../common/utils/reflexion";
import { DEFAULT_CALLBACK, isEmpty } from "../../../common/utils/typing";
import { is } from "../../../common/utils/validation";

const removeDupSlashes = (url: string) => url.replace(/([^:]\/)\/+/g, '$1');

export function responseCodeToStatus(code: ResCode): ResponseStatus {
  return Math.floor(code / 100) as ResponseStatus;
}

export function paramsToQueryString(params: any): string {
  const queryString: string = Object.keys(params)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
    .join('&');
  return queryString;
}

function _url(uri?: string): URL {
  return new URL(uri ? uri : window.location.href);
}

function _domain(uri?: string) {
  const url = _url(uri);
  return url.protocol + '//' + url.hostname + (url.port ? ':' + url.port : '');
}

// get query parameter, looks into the document url by default
export function getQueryParameter(key: string, uri?: string) {
  const url = _url(uri);
  const parameters = _url(decodeURIComponent(url.toString())).searchParams;
  return parameters.get(key);
}

export function isUrlValid(uri: string): boolean {
  try {
    _url(uri);
  } catch (error) {
    return false;
  }
  return true;
}

// this function generate a fake error at server launch
// export const NOT_IMPLEMENTED_HANDLER = logWarning(LogCode.NOT_IMPLEMENTED);
// , // only payload.status available
//   onload: (payload: HttpMessage) => logWarning(LogCode.NOT_IMPLEMENTED), // payload.{status, body} available
//   onredirect: (payload: HttpMessage) => logWarning(LogCode.NOT_IMPLEMENTED),
//   oninformation: (payload: HttpMessage) => logWarning(LogCode.NOT_IMPLEMENTED),
//   onsuccess: (payload: HttpMessage) => logWarning(LogCode.NOT_IMPLEMENTED),
//   onerror: (payload: HttpMessage) => logWarning(LogCode.NOT_IMPLEMENTED),
//   body: null,
// };
export class HttpRequest extends XMLHttpRequest {

  reqEpoch: number;
  resEpoch: number;
  ping: number;
  url: string;
  method: HTTPMethod;
  contentType: ContentType;
  headers: { [key: string]: any };
  tokenBearing: TokenBearing;
  token: string;
  queryString: string; // querystring already put together
  queryParameters: { [key: string]: any }; // query parameters as keys & values
  responseType: ResponseType; // XMLHttpRequestResponseType;
  async: boolean;
  onprogress: (payload: IHttpMessage|ProgressEvent<EventTarget>) => any;
  onload: (payload: IHttpMessage|ProgressEvent<EventTarget>) => any;
  onredirect: (payload: IHttpMessage|ProgressEvent<EventTarget>) => any;
  oninformation: (payload: IHttpMessage|ProgressEvent<EventTarget>) => any;
  onsuccess: (payload: IHttpMessage|ProgressEvent<EventTarget>) => any;
  onerror: (payload: IHttpMessage|ProgressEvent<EventTarget>) => any;
  body: any|string;
  _response: IHttpMessage;

  constructor(o: IHttpRequest) {
    super();
    this.ping = 0;
    this.url = o.url; // request endpoint
    if (!is.url(o.url)) {
      // const prefix = this.url.charAt(0) == '/' ? '' :'/';
      this.url = apis["astrolab"] + this.url;
    }
    if (!is.url(this.url)) {
      throw new Error(`${o.url} is not a valid url`);
    }
    this.url = removeDupSlashes(this.url);
    this.method = o.method ?? HTTPMethod.GET,
    this.token = o.token ?? "";
    this.tokenBearing = o.tokenBearing ?? (o.token ? TokenBearing.HEADER : TokenBearing.NONE) as TokenBearing;
    this.contentType = o.contentType ?? ContentType.JSON;
    this.responseType = o.responseType ?? ResponseType.JSON;
    this.body = o.body ?? "";
    this.headers = {
      // "Origin": _domain(), // injected by browser
      // "Referer": _url(), // injected by browser
      // "Accept-Encoding": "gzip", // injected by browser
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type' : this.contentType
    };
    if (!isEmpty(o.headers)) {
      this.headers = merge(this.headers, o.headers);
    }
    this.queryString = o.queryString ?? '';
    this.queryParameters = o.queryParameters ?? {}; // query parameters as keys & values
    this.async = o.async ?? true;

    // add token to request
    if (this.tokenBearing !== TokenBearing.NONE) {
      const token = this.token ?? session.api.token;
      if (token) {
        switch (this.tokenBearing) {
          // NB: 'Authorization' header is used for basic auth
          case TokenBearing.HEADER: this.headers['Authorization'] = 'Bearer ' + token; break;
          case TokenBearing.QUERY: this.queryParameters["t"] = token; break;
          case TokenBearing.BODY: this.body = { t: token }; break;
        }
      }
    }
    if (!isEmpty(o.queryParameters)) {
      const queryString = paramsToQueryString(o.queryParameters);
      // add the newly created queryString to the existing or replace it
      if (this.queryString)
        this.queryString += '&';
      this.queryString += queryString;
      // ? options.queryString + "&" + queryString
      // : queryString;
    }
    if (this.queryString)
      this.url += this.queryString;

    this.reqEpoch = 0;
    this.resEpoch = 0;
    this._response = {};
    this.open(this.method, this.url, this.async);

    // set request headers
    Object.keys(this.headers).forEach(h => this.setRequestHeader(h, this.headers[h]));

    // unused callbacks
    this.onload = o.onload ?? DEFAULT_CALLBACK;
    this.oninformation = o.oninformation ?? console.info;
    this.onredirect = o.onredirect ?? DEFAULT_CALLBACK;
    // main callbacks
    this.onprogress = o.onprogress ?? DEFAULT_CALLBACK;
    this.onerror = o.onerror ?? console.error;
    this.onsuccess = o.onsuccess ?? DEFAULT_CALLBACK;

    this.registerStateChange(o);
  }

  public getResponse(): IHttpMessage {
    // if (this.readyState === this.HEADERS_RECEIVED)
    // this.response.headers = parseHeaders(this.getAllResponseHeaders())
    return {
      body: this.response ?? "",
      headers: parseHeaders(this.getAllResponseHeaders()),
      method: this.method,
      status: this.status,
      queryParams: this.queryParameters, // or _url(this.uri).searchParams...
      date: this.resEpoch,
      ping: this.ping,
    }
  }

  public registerStateChange(o: IHttpRequest) {

    this.onreadystatechange = () => {

      // compute server reqres ms latency
      if (!this.resEpoch) {
        this.resEpoch = Date.now();
        this.ping = this.resEpoch - this.reqEpoch;
      }

      if (this.readyState === 4) {
        this._response = this.getResponse();
        switch (responseCodeToStatus(this.status)) {
          case ResponseStatus.INFO: return this.oninformation(this._response);
          case ResponseStatus.SUCCESS: return this.onsuccess(this._response);
          case ResponseStatus.REDIRECT: return this.onredirect(this._response);
          // NB: we could follow redirect if required but usually unsafe
          // o.url = this.getResponseHeader("Location");
          // return request(o);
          case ResponseStatus.CLIENT_ERROR:
          case ResponseStatus.SERVER_ERROR:
          default:
            // if (!this.status) this.status = 400;
            return this.onerror(this._response);
        }
      }
    };
  }

  public send(): boolean {
    // post/update...
    if (this.body) {
      let data: any;
      if (this.body instanceof Int8Array || this.body instanceof Uint8Array) {
        // use raw string
        data = this.body;
      } else if (this.body instanceof ArrayBuffer) {
        // convert Buffers to bytes
        data = new Int8Array(this.body);
      } else {
        // jsonify objects
        data = JSON.stringify(this.body);
      }
      super.send(data);
    } else {
      // simple get or empty body post
      super.send();
    }
    this.reqEpoch = Date.now();
    return true;
  }
}

export namespace Sync {
  export function request(options: IHttpRequest): boolean {
    return new HttpRequest(options).send();
  }

  export function get(o: any): boolean {
    o.method = HTTPMethod.GET;
    return request(o);
  }
  export function post(o: any): boolean {
    o.method = HTTPMethod.POST;
    return request(o);
  }
  export function put(o: any): boolean {
    o.method = HTTPMethod.PUT;
    return request(o);
  }
  export function del(o: any): boolean {
    o.method = HTTPMethod.DELETE;
    return request(o);
  }
  export function option(o: any): boolean {
    o.method = HTTPMethod.OPTIONS;
    return request(o);
  }
  export function patch(o: any): boolean {
    o.method = HTTPMethod.PATCH;
    return request(o);
  }
  export function update(o: any): boolean {
    o.method = HTTPMethod.UPDATE;
    return patch(o);
  }
}

export namespace Async {
  export async function request(o: IHttpRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      o.onsuccess = (res: IHttpMessage|ProgressEvent) => resolve(res);
      o.onerror = (res: IHttpMessage|ProgressEvent) => reject(res);
      if (!Sync.request(o)) {
        reject({ status: ResCode.BAD_REQUEST });
      }
    });
  }
  export async function get(options: IHttpRequest): Promise<IHttpMessage> {
    options.method = HTTPMethod.GET;
    return request(options);
  }
  export async function post(options: IHttpRequest): Promise<IHttpMessage> {
    options.method = HTTPMethod.POST;
    return request(options);
  }
  export async function put(options: IHttpRequest): Promise<IHttpMessage> {
    options.method = HTTPMethod.PUT;
    return request(options);
  }
  export async function del(options: IHttpRequest): Promise<IHttpMessage> {
    options.method = HTTPMethod.DELETE;
    return request(options);
  }
  export async function option(options: IHttpRequest): Promise<IHttpMessage> {
    options.method = HTTPMethod.OPTIONS;
    return request(options);
  }
  export async function patch(options: IHttpRequest): Promise<IHttpMessage> {
    options.method = HTTPMethod.PATCH;
    return request(options);
  }
  export async function update(options: IHttpRequest): Promise<IHttpMessage> {
    return patch(options);
  }
}

export const HttpClient = {
  Sync,
  Async,
  get: Async.get,
  post: Async.post,
  put: Async.put,
  del: Async.del,
  option: Async.option,
  patch: Async.patch,
  update: Async.update,
}

export function getBearerToken(
  message: IHttpMessage,
  bearing: TokenBearing=TokenBearing.HEADER,
  name: string = "Authorization"
): string {
  switch (bearing) {
    case TokenBearing.HEADER: return (message?.headers?.[name] as string)?.split(" ")?.[1] || "";
    case TokenBearing.QUERY: return (message?.queryParams?.[name] as string) || "";
    case TokenBearing.BODY: return (message?.body?.[name] as string || "");
  }
  console.warn("Token bearing mode not implemented");
  return "";
}

// borrowed from https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders
export function parseHeaders(s: string): {[k: string]: string|number } {
    // Convert the header string into an array
    // of individual headers
    const arr = s.trim().split(/[\r\n]+/);

    // Create a map of header names to values
    const headers: {[k: string]: string|number} = {};
    arr.forEach((line) => {
      const parts = line.split(': ');
      const name = parts.shift();
      if (!name)
        return;
      const value = parts.join(': ');
      headers[name] = value;
    });
    return headers;
}

export async function ping(url: string): Promise<number> {
  try {
    return (await Async.get({ url })).ping as number;
  } catch(e: any) {
    return (e as IHttpMessage)?.ping ?? -1;
  }
}
