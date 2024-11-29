import ToastComponent from '../components/Toast.vue';
import { LogLevel, XPos, YPos } from '../models/enums';
import { IToast } from '../models/types';
import { app } from '../store';
import { appendVNodeWithContext, fadeOut, IComponent } from '../utils/dom';
import { ActionByName, Optional, sleep } from '../../../common/utils/typing';

export const evalLogLevel = (lvl: LogLevel): boolean =>
  [LogLevel.DEBUG, LogLevel.NOTICE, LogLevel.INFO, LogLevel.SUCCESS].includes(lvl);

let spawnParent: Optional<HTMLElement>;

export class Toast {
  type: LogLevel;
  message: string;
  icon: string;
  actions: ActionByName;
  closable: boolean;
  autoClose: boolean;
  autoCloseSeconds: number;
  delaySeconds: number;
  xPos: XPos;
  yPos: YPos;
  html?: string;
  el?: HTMLElement;
  component?: IComponent | any;
  classes: string;

  constructor(o: IToast) {
    this.type = o.type ?? LogLevel.INFO;
    this.message = o.message ?? '???';
    this.icon = o.icon ?? 'icons/info';
    this.xPos = o.xPos ?? XPos.CENTER;
    this.yPos = o.yPos ?? YPos.BOT;
    this.closable = o.closable ?? true;
    this.actions = o.actions ?? {};
    this.autoClose = o.autoClose ?? true;
    this.autoCloseSeconds = o.autoCloseSeconds ?? 3 + this.message.length * 0.04; // Store.config.value.toaster.autoCloseSeconds;
    this.delaySeconds = o.delaySeconds ?? 0;
    this.classes = [this.type, ...(o.classes ?? [])].join(' '); // css class is the same as the LogLevel enum string
    this.delaySeconds ? setTimeout(() => this.spawn(), this.delaySeconds * 1000) : this.spawn();
  }

  public close = () => { // arrow function required to be recognized as props
    if (!this.el || !this.component?.instance)
      return;
    fadeOut(this.el, () => {
      this.component?.instance?.unmount?.();
      this.el = undefined; // dereference for the update to flush it
    });
  }

  private spawn() {
    if (!spawnParent) {
      spawnParent = document.querySelector('.toaster') as HTMLElement; // spawner
    }

    let props = this; // reactive(this);
    this.component = appendVNodeWithContext(ToastComponent, spawnParent, props, app.instance, true);
    this.el = this.component.element as HTMLElement;
    // fadeIn(this.el);
    app.toasts.add(this);
    if (this.autoClose) {
      setTimeout(() => this.close(), this.autoCloseSeconds * 1000);
    }
  }

  public eval(): boolean {
    return evalLogLevel(this.type);
  }
}

// generic
export const notify = (o: IToast): boolean => new Toast({ ...o, type: o.type ?? LogLevel.INFO }).eval();
export const debug = (o: IToast): boolean => new Toast({ ...o, type: LogLevel.DEBUG }).eval();
export const success = (o: IToast): boolean => new Toast({ ...o, type: LogLevel.SUCCESS }).eval();
export const info = (o: IToast): boolean => new Toast({ ...o, type: LogLevel.INFO }).eval();
export const notice = (o: IToast): boolean => new Toast({ ...o, type: LogLevel.NOTICE }).eval();
export const warning = (o: IToast): boolean => new Toast({ ...o, type: LogLevel.WARNING, icon: 'icons/warning' }).eval();
export const error = (o: IToast): boolean => new Toast({ ...o, type: LogLevel.ERROR, icon: 'icons/error' }).eval();

async function many(options: IToast[], spawnIntervalS: number = 0): Promise<number> {
  let count: number = 0;
  for (const o of options) {
    new Toast(o);
    count++;
    await sleep(spawnIntervalS * 1000);
  }
  return count;
}

export default {
  notify,
  debug,
  success,
  info,
  notice,
  warning,
  error,
  many,
};
