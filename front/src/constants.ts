import { XPos, YPos } from "./models/enums";
import { AppRoute, NavRoute } from "./models/types";
import { toFloatAuto } from "../../common/utils/format";
import { roundAutoPrecision } from "../../common/utils/maths";
import { transposeObject } from "../../common/utils/reflexion";

export const modaler = {
  baseZIndex: 1000,
}

export const toaster = {
  posX: XPos.RIGHT,
  posY: YPos.BOT,
}

// Define routes with component and props
export const appRoutes: {[path: string]: AppRoute } = {
  '/': { title: 'Lobby' },
  '/games': { title: 'Games' },
  '/snuke': { title: 'Snuke' },
  '/bull-run': { title: 'Bull Run' },
  '/blue-pill': { title: 'Blue Pill' },
  '/coinect-4': { title: 'Coinect 4' },
  '/ethris': { title: 'Ethris' },
  '/bombermoon': { title: 'Bombermoon' },
  '/flappy-bull': { title: 'Flappy Bull' },
  '/about': { title: 'About' },
  '/partners': { title: 'Partners' },
  '/links': { title: 'Links' },
  '/not-found': { title: 'Not Found' },
  '/docs': { title: 'Md', props: { file: 'docs/index.md' } },
}

export const navRoutes: NavRoute[] = [
  // { title: 'Lobby', path: '#/' },
  {
    title: 'Games', path: '#/games', children: [
      { title: 'Snuke', path: '#/snuke' },
      { title: 'Bull Run', path: '#/bull-run' },
      { title: 'Blue Pill', path: '#/blue-pill' },
      { title: 'Coinect 4', path: '#/coinect-4'},
      { title: 'Ethris', path: '#/ethris'},
      { title: 'Bombermoon', path: '#/bombermoon'},
      { title: 'Flappy Bull', path: '#/flappy-bull' },
      // { title: '3M Cliff', path: '#/3m-cliff' },
    ]
  },
  {
    title: 'Stats', path: '#/stats', children: [
      { title: 'Protocol', path: '#/protocol' },
      { title: 'Scoreboard', path: '#/scoreboard' },
    ]
  },
];

export const externalLinks: NavRoute[] = [
  // { title: 'Docs', icon: 'icons/docs.svg', path: '#/docs' }, // not external anymore
  { title: 'X', icon: 'icons/x.svg', path: 'https://x.com/BlueBull' },
  { title: 'Github', icon: 'icons/github.svg', path: 'https://github.com/BlueBull' },
  { title: 'Telegram', icon: 'icons/telegram.svg', path: 'https://t.me/BlueBull' }
];

export const dbConfig = {
  version: 1, // parseInt(process.env.npm_package_version!.split('.')[0]),
  name: "blue-bull",
  stores: [
    { name: "svg", keyPath: "id" },
    { name: "lottie", keyPath: "id" },
    { name: "img", keyPath: "id" },
    { name: "video", keyPath: "id" },
    { name: "endpoint", keyPath: "id" },
    { name: "md", keyPath: "slug" },
    { name: "brands", keyPath: "slug" },
    { name: "networks", keyPath: "slug", indexes: [{ key: "value.id", unique: true }] },
    { name: "protocols", keyPath: "slug" },
    { name: "tokens", keyPath: "slug", indexes: [{ key: "value.symbol", unique: false }] },
  ]
};

export const apis: { [key: string]: string } = {
  blue: process.env.API_ROOT ?? 'https://api.bluebull.wtf/v1/',
  astrolab: 'https://api.astrolab.fi/v1/',
  deDotFi: 'https://api-scanner.defiyield.app/',
  defiSafety: 'https://api.defisafety.com/',
  exponential: 'https://api.exponential.fi/',
  defiLlama: 'https://api.llama.fi/',
  defiLlamaYield: 'https://yields.llama.fi/',
  defiLlamaToken: 'https://coins.llama.fi/',
  chainlink: 'https://data.chain.link/api/',
  _1inch: 'https://api.1inch.dev/swap/v5.2/',
  debank: 'https://pro-openapi.debank.com/v1/',
  rabby: 'https://api.rabby.io/v1/',
  cointool: 'https://cointool.glitch.me/',
}

export const cdns: { [key: string]: string } = {
  astrolab: process.env.CDN_ROOT ?? 'https://cdn.astrolab.fi/',
}

export const registries: { [key: string]: string } = {
  astrolab: process.env.REGISTRY_ROOT ?? 'https://registry.astrolab.fi/',
  btr: process.env.REGISTRY_ROOT ?? 'https://registry.bluebull.wtf/',
}

export const imgCdnRoot = `${cdns.astrolab}assets/images/`;

export const addressZero = '0x0000000000000000000000000000000000000000';
export const mockIcon = "/svgs/mask.svg";

const rootStyles = getComputedStyle(document.documentElement);

const getCssVar = (name: string): string =>
  rootStyles.getPropertyValue(name).trim();

export const theme = {
  fg: [
    getCssVar('--fg-0'),
    getCssVar('--fg-1'),
    getCssVar('--fg-2'),
  ],
  bg: [
    getCssVar('--bg-0'),
    getCssVar('--bg-1'),
    getCssVar('--bg-2'),
  ],
  primary: getCssVar('--primary'),
  secondary: getCssVar('--secondary'),
  tertiary: getCssVar('--tertiary'),
  active: getCssVar('--active'),
  black: getCssVar('--black'),
  white: getCssVar('--white'),
  darker: getCssVar('--darker'),
  dark: getCssVar('--dark'),
  darkerGrey: getCssVar('--darker-grey'),
  darkGrey: getCssVar('--dark-grey'),
  grey: getCssVar('--grey'),
  lightGrey: getCssVar('--light-grey'),
  lighterGrey: getCssVar('--lighter-grey'),
  light: getCssVar('--light'),
  lighter: getCssVar('--lighter'),
  green: getCssVar('--green'),
  orange: getCssVar('--orange'),
  red: getCssVar('--red'),
  brown: getCssVar('--brown'),
  yellow: getCssVar('--yellow'),
  cyan: getCssVar('--cyan'),
  pink: getCssVar('--pink'),
  violet: getCssVar('--violet'),
  positive: getCssVar('--positive'),
  negative: getCssVar('--negative'),
  success: getCssVar('--success'),
  failure: getCssVar('--failure'),
  error: getCssVar('--error'),
  warning: getCssVar('--warning'),
  info: getCssVar('--info'),
  debug: getCssVar('--debug'),
};

export const chartOptions = {
  base: {
    responsive: true,
    layout: {
      padding: {
        left: 0,
      }
    },
    scales: {
      x: {
        // align: 'start',
        // maxTicksLimit: 7,
        // autoSkip: true, // auto-skipping to avoid clutter
        // maxRotation: 0, // prevent rotation
        // minRotation: 0,
        // grace: 0,
        // bounds: 'data',
        // offset: false,
        title: {
          display: false,
          // text: 'Months',
          // color: '#FFF',
          // padding: { top: 10, bottom: 10 },
          font: {
            family: 'Inter',
            size: 20,
            style: 'normal',
            // lineHeight: 1.2
          },
        },
        ticks: {
          // beginAtZero: false,
          // type: 'linear',
          display: true,
          color: theme.darkGrey,
          font: {
            family: 'IBM Plex Mono, consolas',
            size: 9.5,
            style: 'normal',
            // lineHeight: 2
          },
          // callback: (index: number, label: number) => label
        },
        grid: {
          display: false,
          color: theme.darkGrey,
          lineWidth: 1,
          drawBorder: true,
          borderColor: theme.darkGrey,
        },
      },
      y: {
        type: 'linear',
        beginAtZero: false,
        position: 'right',
        afterFit: (scale: any) => {
          scale.width = 60; // fixed width for the y-axis labels
        },
        ticks: {
          padding: 0,
          // beginAtZero: false,
          // type: 'linear',
          display: true,
          autoSkip: true, // auto-skipping to avoid clutter
          maxRotation: 0, // prevent rotation
          minRotation: 0,
          color: theme.darkGrey, // Color of tick labels
          font: {
            family: 'IBM Plex Mono, consolas',
            size: 9.5,
            style: 'normal',
            // lineHeight: 2
          },
          callback: (v: number) => toFloatAuto(v, false)
        },
        grid: {
          display: false,
          color: theme.darkGrey,
          lineWidth: 1,
          drawBorder: true,
          borderColor: theme.darkGrey
        },
      }
    },
    animations: {
      // tension: {
      //   duration: 1000,
      //   easing: 'easeOutQuart',
      //   from: 1,
      //   to: 0,
      //   loop: false
      // },
      // drawLine: {
      //   type: 'number',
      //   duration: 500,
      //   easing: 'easeInOutQuart',
      //   from: 0,
      //   to: 1,
      //   loop: false
      // }
    },
    interaction: {
      mode: 'nearest',
      intersect: false // allow interaction even if not directly over a point
    },
  },
  price: {
    datasets: [
      {
        label: 'Price',
        // backgroundColor: theme.orange,
        borderColor: theme.orange,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.2,
        data: []
      }, {
        label: 'Target Max',
        // backgroundColor: '#cccccccc',
        borderColor: theme.lightGrey,
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.2,
        data: []
      }, {
        label: 'Target Min',
        // backgroundColor: '#cccccccc',
        borderColor: theme.lightGrey,
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.2,
        data: []
      }, {
        label: 'Current Max',
        // backgroundColor: '#cccccccc',
        borderColor: theme.primary,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0,
        data: []
      }, {
        label: 'Current Min',
        // backgroundColor: '#cccccccc',
        borderColor: theme.primary,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0,
        data: []
      }
    ],
  },
  oscillators: {
    datasets: [
      {
        label: 'Volatility', // stdev
        borderColor: theme.red,
        backgroundColor: theme.red + '20',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.2,
        data: []
      },
      {
        label: 'Momentum', // tick rsi
        borderColor: theme.cyan,
        backgroundColor: theme.cyan + '20',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.2,
        data: []
      },
      {
        label: 'Trend', // sma slope
        borderColor: theme.pink,
        backgroundColor: theme.pink + '20',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.2,
        data: []
      }
    ]
  },
  plugins: {
    legend: {
      position: 'top',
      align: 'start', // left align
      labels: {
        boxWidth: 20,
        padding: 10
      }
    },
    tooltip: {
      enabled: true,
      mode: 'index', // all datasets at index
      intersect: false, // tooltip appears when hovering near a point
      position: 'average',
      displayColors: false,
      // labelTextColors: [],
      // itemSort: (a: any, b: any) => a.index - b.index,
      borderColor: theme.darkGrey,
      borderWidth: 1,
      padding: 8,
      bodyFont: {
        family: 'IBM Plex Mono, monospace',
        size: 12,
        style: 'normal',
        weight: 'normal',
      },
      titleFont: {
        family: 'IBM Plex Mono, monospace',
        size: 13,
        style: 'normal',
        weight: 500,
      },
      callbacks: {
        label: (ctx: any) => (ctx.dataset.label + ': ').padEnd(15, ' ') + roundAutoPrecision(ctx.raw),
      }
    },
    crosshair: {
      line: {
        color: theme.grey,
        width: 1,
        dashPattern: [5, 5] // 5 pixels on, 5 pixels off
      },
      zoom: {
        enabled: true,
        zoomboxBackgroundColor: theme.grey + '44', // 44 == alpha channel
        zoomboxBorderColor: theme.grey,
        zoomButtonText: 'Reset Zoom',
        zoomButtonClass: 'bordered px-2 m-2 font-size-s absolute right-0 top-0 backdrop-blur-light'
      },
      sync: {
        enabled: true,            // enable trace line syncing with other charts
        group: 1,                 // chart group
        suppressTooltips: false   // suppress tooltips when showing a synced tracer
      },
    },
  },
};

export const l2s: string[] = ["arbitrum", "optimism", "linea", "mantle", "scroll", "zksync", "zkevm", "metis", "loopring", "blast", "movement"];

// NB: default rpcs are defined in endpoints.json (first one is used for each)
export const unwraps: { [symbol: string]: string } = {
  weth: 'eth',
  wmatic: 'matic',
  warb: 'arb',
  wop: 'op',
  wftm: 'ftm',
  wbnb: 'bnb',
  wavax: 'avax',
  wmovr: 'movr',
  wglmr: 'glmr',
  wkava: 'kava',
  wcanto: 'canto',
  wsol: 'sol',
  wsui: 'sui',
  wapt: 'apt',
  wbtc: 'btc',
  wbch: 'bch',
  wltc: 'ltc',
  wcro: 'cro',
  wcelo: 'celo',
  wrose: 'rose',
};
export const wraps = transposeObject(unwraps);
