import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { arbitrum, mainnet } from '@reown/appkit/networks';
import { createAppKit, useAppKit } from '@reown/appkit/vue';

import { dateToString, shiftDate } from '@common/utils/date';
import { parseJwt } from "@common/utils/format";
import { Callable } from '@common/utils/typing';
import { App, ref, shallowRef } from "vue";
import { modaler } from './constants';
import { _Storage } from './services/storage';
import { IndexedDBCache } from "./utils/db";

export const app = {
  instance: {} as App<Element>,
  element: {} as HTMLElement,
  rect: {} as DOMRect,
  nextChartId: 1 as number,
  chartById: {} as { [key: number|string]: any },
  modalById: {} as { [key: number|string]: any },
  modalZOffset: modaler.baseZIndex,
  modalByZIndex: {} as { [key: number]: any },
  closeById: {} as { [key: number|string]: Callable },
  toasts: new Set(),
};

export const clients = {
  http: {} as any,
  ws: {} as any,
}

export const router = {
  instance: {} as any,
  element: {} as HTMLElement,
  rect: {} as DOMRect,
  pathname: ref(location.pathname),
  view: shallowRef(),
  viewProps: ref(),
  components: {} as any,
}

export const session = {
  activeNonce: ref(""),
  activeSig: ref(""),
  storage: _Storage.local('btr'),
  disclaimer: {
    accepted() {
      const date = session.storage.get('disclaimer:accepted');
      return date && new Date(date) > shiftDate({ day: -14 }); // max validity is 2 weeks
    },
    accept() {
      session.storage.set('disclaimer:accepted', dateToString(new Date()));
      return true;
    }
  },
  api: {
    token: {
      value: "",
      expiry: 0,
      get() {
        this.value ??= session.storage.get('api:token') ?? "";
        return this.value;
      },
      set(t: string, expiry?: number) {
        expiry ??= parseJwt(t)?.exp;
        this.value = t;
        session.storage.set('api:token', t);
        if (expiry) {
          session.storage.set('api:token:expiry', expiry.toString());
          this.expiry = expiry;
        }
      },
      flush() {
        session.storage.flush('api:token');
        session.storage.flush('api:token:expiry');
        this.value = "";
        this.expiry = 0;
      },
    },
  },
  networks: [] as any[],
  rpcByNetwork: {} as { [key: string]: any },
}

export const cache: { [key: string]: IndexedDBCache } = {
  svg: new IndexedDBCache({ storeName: "svg", expiry: 3600 * 12 }),
  endpoint: new IndexedDBCache({ storeName: "endpoint", expiry: 3600 * 12 }),
  md: new IndexedDBCache({ storeName: "md", expiry: 3600 * 12 }),
};

// Reown/web3modal
const appKit = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [mainnet, arbitrum],
  metadata: {
    name: 'Blue Bull',
    description: process.env.npm_package_description!,
    url: location.origin,
    icons: ["/pngs/maskable-icon-512x512.png"],
  },
  projectId: process.env.REOWN_PROJECT_ID!,
  features: {
    analytics: false
  },
  // chainImages,
  // featuredWalletIds: Object.values(FEATURED_WALLETS),
  themeMode: "dark",
  themeVariables: {
    "--w3m-border-radius-master": "1px",
    "--w3m-font-family": "Inter",
    "--w3m-accent": "var(--primary)",
    "--w3m-color-mix": "var(--grey)",
    // '--w3m-color-mix-strength': 40
  },
});

export const w3m = useAppKit()
