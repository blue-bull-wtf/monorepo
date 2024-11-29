import { ComponentPublicInstance, createApp, createVNode, render, VNode } from 'vue';
import { md5 } from '../../../common/utils/crypto';
import { addUserAgent, cleanObject, cloneDeep } from '../../../common/utils/reflexion';
import { Callable } from '../../../common/utils/typing';

export interface IComponent {
  vnode: VNode;
  instance: ComponentPublicInstance<any>;
  element: HTMLElement;
  id: string; // hash
}

export async function waitImagesLoaded(): Promise<void> {
  const imgs: NodeListOf<HTMLImageElement> | null = document.querySelectorAll("img");
  if (!imgs?.length) {
    return Promise.resolve();
  }
  const promises: Promise<void>[] = [];

  for (let i = 0; i < imgs.length; i++) {
    if (imgs[i].complete) {
      continue;
    }
    const p = new Promise((resolve) => imgs[i].addEventListener("load", () => resolve(true)));
  }
  await Promise.all(promises);
  return Promise.resolve();
}

export function htmlToElement(html: string): HTMLElement {
  const template = document.createElement("template");
  html = html.trim(); // Never return a text node of whitespace as the result
  // if (!html) { return null; }
  template.innerHTML = html;
  return template.content.firstChild as HTMLElement;
}

// export function selectClosestParent
export function collectionHas(a: NodeList, b: Node): boolean {
  // helper function (see below)
  for (let i = 0, len = a.length; i < len; i++) {
    if (a[i] === b) {
      return true;
    }
  }
  return false;
}

export function findParent(el: Node, selector: string): Element {
  const all: NodeList = document.querySelectorAll(selector);
  let cur = el.parentNode;
  while (cur && !collectionHas(all, cur)) {
    // keep going up until you find a match
    cur = cur.parentNode; // go up
  }
  return cur as Element; // will return null if not found
}

export function findClosest(el: Element, selector: string): Element | null {
  if (!el) {
    return null;
  }
  let matchedElement: Element | null = null;
  if (el.matches(selector)) {
    return el;
  }
  matchedElement = el.querySelector(selector);
  if (matchedElement) {
    return matchedElement;
  }
  let prevExplored: Element = el;
  let parent = el.parentElement;
  while (parent) {
    if (parent.matches(selector)) {
      return parent;
    }
    let currentSibling = parent.firstChild;
    while (currentSibling) {
      if (currentSibling.isSameNode(prevExplored)
        || !(currentSibling instanceof Element)) {
        currentSibling = currentSibling.nextSibling;
        continue;
      }
      if (currentSibling.matches(selector)) {
        return currentSibling;
      }
      matchedElement = currentSibling.querySelector(selector);
      if (matchedElement) {
        return matchedElement;
      }
      prevExplored = currentSibling;
      currentSibling = currentSibling.nextSibling;
    }
    parent = parent.parentElement;
  }
  return null;
}

// TODO: implement version with XPath, best for unique dom node identifying (no need to look into class names and attributes)
export function getElementUid(e: Element, useParent: boolean = true): string {
  if (!e) { return ""; }
  const parentHash: string = useParent && e?.parentElement ? getElementUid(e.parentElement, false) : "";
  const attributes = Object.values(e.attributes).map((a) => a.name).join(",");
  return [parentHash + e.nodeName, attributes, e.className, e.id].join("|");
}

export function getElementHash(e: Element, useParent: boolean = true): string {
  return md5(getElementUid(e, useParent));
}

export function getRemSize(): number {
  return parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function remToPixels(rem: number): number {
  return getRemSize() * rem;
}

export function getElementDataAttribute(el: Element, attribute: string = "value"): string {
  return (el as HTMLElement).dataset[attribute] || "";
}

// returns the copied content length
export async function copyToClipboard(s: string | any, addUA = false): Promise<number> {
  if (typeof s !== "string") {
    if (addUA)
      s = addUserAgent(s);
    s = JSON.stringify(cleanObject(cloneDeep(s)));
  }
  try {
    await navigator.clipboard.writeText(s);
  } catch (e: any) {
    return 0;
  }
  return s.length;
}

// returns the saved content length
export function saveAs(filename: string, s: string): number {
  try {
    const el = document.createElement("a");
    el.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(s));
    el.setAttribute("download", filename);

    if (document.createEvent) {
      const event = document.createEvent("MouseEvents");
      event.initEvent("click", true, true);
      el.dispatchEvent(event);
    } else {
      el.click();
    }
    return s.length;
  } catch (e: any) {
    return 0;
  }
}

export function getPixelRatio(): number {
  return window.devicePixelRatio || 1;
}

export function renderVNode(component: ComponentPublicInstance<any>, container: HTMLElement, props = {}) {

  // create component instance
  const vnode = createVNode(component, props);
  // mount to a container (overrides the existing html)
  render(vnode, container);
}

export function appendVNode(component: ComponentPublicInstance<any>, container: HTMLElement, props = {}): IComponent {

  // create component instance
  const vnode = createVNode(component, props);
  const wrap = document.createElement("template");
  render(vnode, wrap);
  const element = wrap.children[0] as HTMLElement;
  const id = getElementHash(element);
  // append to an existing container
  container.appendChild(wrap.children[0]); // vnode.el
  return {
    vnode,
    instance: vnode.component,
    element,
    id
  }
}

export function appendVNodeWithContext(
  component: ComponentPublicInstance<any>,
  container: HTMLElement,
  props = {},
  app: ReturnType<typeof createApp>, // = State.app.instance as any,
  prepend: boolean = false,
  nowrap: boolean = false,
): IComponent {

  const appInstance = createApp(component, props);
  for (const [key, value] of Object.entries(app._context.components)) {
    appInstance.component(key, value);
  }
  let wrap: HTMLElement;

  if (!nowrap) {
    // inject as container's last child
    wrap = htmlToElement('<div class="instance-wrapper"></div>');
    prepend ? container.prepend(wrap) : container.append(wrap);
  } else {
    // merge with the container itself
    wrap = container;
  }
  appInstance.mount(wrap);

  return {
    vnode: (wrap as any)._vnode ?? appInstance._component as VNode,
    instance: (appInstance._component as any).proxy ?? appInstance,
    element: wrap,
    id: getElementHash(wrap)
  }
}

export function isOrEmbedsComponent(component: any, target: any): boolean {

  const targetName = (typeof target == "string") ? target : target.name;
  if (typeof component == "string") {
    return component === targetName;
  }
  return component.name === targetName
    || component.components?.[targetName]?.name === targetName
    || component.mixins?.some((mixin: any) => mixin.name === targetName)
    || (component.extends && isOrEmbedsComponent(component.extends, targetName));
}

export function animateIn(
  el: HTMLElement,
  // parent: HTMLElement|null=null,
  animationClass="zoom-in",
  cb: Callable=()=>{}
): boolean {

  const afterAnimate = () => { cb(); };

  // el.style.opacity = "0";
  el.addEventListener("transitionend", afterAnimate);
  el.addEventListener("transitioncancel", afterAnimate);
  // if (parent) { parent.appendChild(el); }
  el.classList.add(animationClass);
  return true;
}

export function animateOut(
  el: HTMLElement,
  animationClass="zoom-out",
  cb: Callable=()=>{}
): boolean {

  const afterAnimate = () => { el.remove?.(); cb(); };

  // el.style.opacity = "1";
  el.addEventListener("transitionend", () => afterAnimate());
  // el.addEventListener("transitioncancel", () => afterAnimate());
  el.addEventListener("animationend", () => afterAnimate());
  // el.addEventListener("animationcancel", () => afterAnimate());

  el.classList.add(animationClass);
  return true;
}

export function zoomIn(
  el: HTMLElement,
  cb: Callable=()=>{}
): boolean {
  return animateIn(el, "zoom-in", cb);
}

export function zoomOut(
  el: HTMLElement,
  cb: Callable=()=>{}
): boolean {
  return animateOut(el, "zoom-out", cb);
}

export function fadeIn(
  el: HTMLElement,
  cb: Callable=()=>{}
): boolean {
  return animateIn(el, "fade-in", cb);
}

export function fadeOut(
  el: HTMLElement,
  cb: Callable=()=>{}
): boolean {
  return animateOut(el, "fade-out", cb);
}
