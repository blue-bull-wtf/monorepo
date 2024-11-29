import { isObject, isFunction, Optional, isEmpty } from "./typing";
// import UAParser, { IResult as IUserAgent } from 'ua-parser-js';

// let ua: Partial<IUserAgent>|undefined;

// export function getUserAgent(): Partial<IUserAgent> {
//   if (!ua) {
//     ua = new UAParser().getResult() as Partial<IUserAgent>;
//     delete ua.ua; // noisy full string
//   }
//   return ua;
// }

export function addUserAgent(o: any): any {
  if (typeof o !== "object")
    return o;
  o.userAgent = {}; // getUserAgent();
  return o;
}

export function stringifyWithUA(o: any): string {
  return JSON.stringify(addUserAgent(o));
}

const safeScopeBlockedList = new Set([
  'eval', 'window', 'global',
  'Function', 'setTimeout', 'setInterval',
  'importScripts', 'XMLHttpRequest', 'fetch',
  'postMessage'
]);

export function safeEval (src: string, ctx: any = {}): any {
  if (!ctx.hasOwnProperty('result'))
    ctx.result = null;
  ctx = new Proxy(ctx, {
    has: (target: any, prop: string) => {
      if (safeScopeBlockedList.has(prop))
        throw new Error(`${prop} blocked`);
      return prop in target;
    },
    get: (target: any, prop: string) => {
      if (safeScopeBlockedList.has(prop))
        throw new Error(`${prop} blocked`);
      return target?.[prop];
    },
  });

  const fn = new Function(`with(this) { result = (${src}) }`);
  try { fn.call(ctx); } catch (e) { console.error(e); }
  return ctx.result;
}

// returns the names of all class/object embedded methods as array
export function getObjectMethods(o: any): string[] {

  if (!isObject(o)) {
    console.log("Can only get methods from objects");
    return [];
  }
  return Object.getOwnPropertyNames(o).filter(k => isFunction(o[k]));
}

export function getObjectPropNames(o: any, keepFunctions = false): string[] {

  if (!isObject(o)) {
    return [];
  }
  let names: Set<string> = new Set();
  if (!keepFunctions) {
    for (const n of Object.getOwnPropertyNames(o))
      if (!isFunction(o[n]))
        names.add(n);
  } else {
    Object.getOwnPropertyNames(o).forEach(n => names.add(n));
  }
  return Array.from(names);
}

// returns the values of all class/object attributes as array
export function getObjectProps(o: any, keepFunctions = false): any[] {
  return getObjectPropNames(o, keepFunctions).map(n => o[n]);
}

export function getObjectKeyForValue(o: Record<string, any>, value: any): Optional<any> {
  for (const key in o)
    if (o.hasOwnProperty(key) && o[key] === value)
      return key;
  return undefined;
}

export function intersect<T>(a: T[], b: T[]): T[] {
  // return a.filter((x) => b.includes(x));
  const set = new Set(a);
  return b.filter(v => set.has(v));
}

export function cloneDeep(val: any, map = new WeakMap()) {
  // base case for non-objects
  if (typeof val !== 'object' || val === null) return val;
  if (val instanceof Date) return new Date(val);
  if (val instanceof RegExp) return new RegExp(val.source, val.flags);
  if (typeof val === 'function') return val;
  if (map.has(val)) return map.get(val);

  let clone: any;

  if (Array.isArray(val)) {
    clone = [];
    map.set(val, clone);
    val.forEach((item, index) => {
      clone[index] = cloneDeep(item, map);
    });
  } else {
    clone = {};
    map.set(val, clone);
    for (const key in val) {
      clone[key] = cloneDeep(val[key], map);
    }
  }

  return clone;
}

export function merge(target: any, ...sources: any[]) {
  if (!sources.length) return target;

  const source = sources.shift();

  if (source === null || source === undefined) return merge(target, ...sources);

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (isObject(source[key])) {
          if (!target[key] || !isObject(target[key])) {
            target[key] = {};
          }
          merge(target[key], source[key]); // recursively merge
        } else {
          target[key] = source[key];
        }
      }
    }
  }

  return merge(target, ...sources);
}

export function transposeObject(o: {[k: string|number]: string|number}): any {
  if (!o)
    return {};
  const t: {[k: string|number]: any} = {};
  for (const key in o)
    if (o.hasOwnProperty(key))
      t[o[key]] = key;
  return t;
}

export function getLineNumberFromErrorPath(instancePath: string, parsedJson: any): number {
  const pathParts = instancePath.split('/').filter(Boolean);

  // count lines until we find our target
  let currentLineCount = 1; // start at line 1
  let foundPath = false;

  function traverseAndCount(obj: any, depth: number = 0): boolean {
    // check if we've found our path already
    if (foundPath) return true;

    for (const [key, value] of Object.entries(obj)) {
      // count opening line of key
      currentLineCount++;

      // check if this key matches our current path part
      if (key === pathParts[depth]) {
        if (depth === pathParts.length - 1) {
          // we found our complete path
          foundPath = true;
          return true;
        }

        // if this is part of our path but not the end, traverse deeper
        if (value && typeof value === 'object') {
          if (traverseAndCount(value, depth + 1)) {
            return true;
          }
        }
      } else if (value && typeof value === 'object') {
        // if this isn't our target path, still need to count its lines
        traverseAndCount(value, depth);
      }

      // count possible additional lines within the value
      if (value && typeof value === 'object') {
        // object values add their closing brace line
        currentLineCount++;
      }
    }
    return false;
  }

  traverseAndCount(parsedJson);

  return currentLineCount;
}

export function circularReferenceReplacer() {
  const seen = new WeakSet();
  return (k: any, v: any) => {
    if (typeof v === "object" && v !== null) {
      if (seen.has(v))
        return "[Circular]";
      seen.add(v);
    }
    return v;
  };
};

const cleanExclude: string[] = ['searchIndex'];
export function cleanObject(o: any): any {
  if (!o || typeof o !== 'object')
    return o;
  if (Array.isArray(o))
    return o.map(cleanObject).filter(v => !isEmpty(v));
  for (const k of Object.keys(o)) {
    if (cleanExclude.includes(k) || isEmpty(o[k]))
      delete o[k];
    else if (typeof o[k] == "object")
      o[k] = cleanObject(o[k]);
  }
  return o;
}
