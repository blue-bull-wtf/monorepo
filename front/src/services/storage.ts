import { Stringifiable, isStr } from "../../../common/utils/typing";

export class _Storage {
  protected prefix: string;
  protected storage: Storage;

  constructor(storage: Storage, prefix?: string) {
    this.prefix = prefix ?? '';
    if (![sessionStorage, localStorage].includes(storage))
      throw new Error('Storage type non supported');
    this.storage = storage;
  }

  // base session storage
  public set = (key: Stringifiable, value: any) =>
    this.storage.setItem(key.toString(), isStr(value) ? value : JSON.stringify(value));
  public get(key: Stringifiable): any {
    let raw = this.storage.getItem(key.toString());
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  public flush = (key: string) => this.storage.removeItem(`${this.prefix}.${key}`);

  // accept/refuse/sign variables
  public refuse = (key: string) => this.set(`${this.prefix}.${key}`, false);
  public accept = (key: string) => this.set(`${this.prefix}.${key}`, true);
  public refuseForever = (key: string) => this.set(`${this.prefix}.${key}`, false);
  public acceptForever = (key: string) => this.set(`${this.prefix}.${key}`, true);
  public check = (key: string) => this.get(`${this.prefix}.${key}`) || this.get(`${this.prefix}.${key}`) || false;

  // public async sign(key: string, message: string): Promise<boolean> {
  //   const signature = await sign(message);
  //   if (!signature) return false;
  //   // force accept + store signature locally
  //   this.accept(key);
  //   this.set(`${this.prefix}.${key}.sig`, signature);
  //   return true;
  // }

  public static local = (prefix: string) => new _Storage(localStorage, prefix);
  public static session = (prefix: string) => new _Storage(sessionStorage, prefix);
}
