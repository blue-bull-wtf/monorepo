import { session } from "../store";
import { BaseWsMessage } from "@common/types/messages";

export class WS {
  private static instance: WS;
  private ws?: WebSocket;
  private listeners: Set<(data: any) => void> = new Set();
  private url: string;

  static getInstance(url: string = 'ws://localhost:8080'): WS {
    if (!WS.instance) {
      WS.instance = new WS(url);
    }
    return WS.instance;
  }

  private constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.listeners.forEach(listener => listener(data));
    };
    this.ws.onopen = () => {
      this.notifyListeners({ type: 'ws-open' });
    };
    this.ws.onclose = () => {
      this.notifyListeners({ type: 'ws-close' });
    };
  }

  private notifyListeners(data: any) {
    this.listeners.forEach(listener => listener(data));
  }

  reconnect() {
    if (this.ws) {
      this.ws.close();
      this.connect();
    }
  }

  subscribe(listener: (data: any) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeTo(type: string, listener: (data: any) => void) {
    const wrapped = (data: any) => {
      if (data.type === type) {
        listener(data);
      }
    };
  
    this.listeners.add(wrapped);
    return () => this.listeners.delete(wrapped);
  }

  send(message: any, stringify = true) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(stringify ? JSON.stringify(message) : message);
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  sendSigned(message: BaseWsMessage, stringify = true) {
    message.sig = session.activeSig.value;
    message.nonce = session.activeSig.value;
    return this.send(message, stringify);
  }
}
