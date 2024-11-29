import Chart from "chart.js/auto";

export const fetchShader = async (path: string): Promise<string> => {
  const response = await fetch(`/shaders/${path}`);
  if (!response.ok) {
    throw new Error(`Failed to load shader at ${path}: ${response.status}`);
  }
  return response.text();
};

// compile a shader
export function loadShader(
  gl: WebGLRenderingContext,
  type: GLenum,
  source: string
) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      "Error occurred while compiling the shaders", gl.getShaderInfoLog(shader), shader
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function loadVertexShader(gl: WebGLRenderingContext, source: string) {
  return loadShader(gl, gl.VERTEX_SHADER, source);
}

export function loadFragmentShader(gl: WebGLRenderingContext, source: string) {
  return loadShader(gl, gl.FRAGMENT_SHADER, source);
}

export async function fetchLoadShader(
  gl: WebGLRenderingContext,
  type: GLenum,
  path: string
) {
  return await fetchShader(path).then((source) => loadShader(gl, type, source));
}

export async function fetchLoadVertexShader(
  gl: WebGLRenderingContext,
  path: string
) {
  return await fetchLoadShader(gl, gl.VERTEX_SHADER, path);
}

export async function fetchLoadFragmentShader(
  gl: WebGLRenderingContext,
  path: string
) {
  return await fetchLoadShader(gl, gl.FRAGMENT_SHADER, path);
}

export function createProgram(
  gl: WebGLRenderingContext,
  shaders: WebGLShader[]
) {
  const program = gl.createProgram()!;
  for (const shader of shaders) gl.attachShader(program, shader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(program)
    );
    return null;
  }
  return program;
}

export async function fetchCreateProgram(
  gl: WebGLRenderingContext,
  shaderPaths: string[]
) {
  const sources = await Promise.all(
    shaderPaths.map((path) => fetchShader(path))
  );
  const isVertex = shaderPaths.map((path) => path.includes("vert"));
  const shaderObjects = sources
    .map((source, i) =>
      isVertex[i]
        ? loadVertexShader(gl, source)
        : loadFragmentShader(gl, source)
    )
    .filter((shader) => !!shader) as WebGLShader[];
  return createProgram(gl, shaderObjects)!;
}

export interface SvgContainerOptions {
  width?: any;
  height?: any;
  pathData?: string;
  borderRadius?: any;
  notchWidth?: any;
  notchHeight?: any;
  strokeColor?: string;
  strokeWidth?: number;
  filter?: string;
}

export const FLIP_CLASSES: { [key: string]: string[] } = {
  tr: [],
  tl: ["flip","horizontal"],
  br: ["flip","vertical"],
  bl: ["flip","both"],
};

export function flipSvgTransform(o: SvgContainerOptions, direction="tr") {
  const centerX = o.width! / 2;
  const centerY = o.height! / 2;

  switch (direction) {
    case "tl": return `translate(${centerX}, 0) scale(-1, 1) translate(-${centerX}, 0)`;
    case "br": return `translate(0, ${centerY}) scale(1, -1) translate(0, -${centerY})`;
    case "bl": return `scale(-1, -1)`;
    default:
      return "";
  }
}

export function generateNotchedPath(o: SvgContainerOptions): string {
  const { width, height, borderRadius, notchHeight, notchWidth, strokeWidth } = <any>o;
  const notchRatio = notchWidth / notchHeight;
  return `
  M ${width-borderRadius*2} ${height}
  H ${borderRadius}
  A ${borderRadius} ${borderRadius} 0 0 ${strokeWidth} ${strokeWidth} ${height-borderRadius}
  V ${borderRadius}
  C ${strokeWidth} ${borderRadius/2} ${borderRadius/2} ${strokeWidth} ${borderRadius} ${strokeWidth}
  h ${width - notchWidth - 2.2*borderRadius}
  c ${borderRadius} 0 ${borderRadius} 0 ${borderRadius*(1+notchRatio/2)} ${borderRadius/(notchRatio*2)}
  l ${notchWidth-borderRadius} ${notchHeight-borderRadius}
  a ${borderRadius} ${borderRadius} 0 0 ${strokeWidth} ${borderRadius/2} ${borderRadius}
  v ${height-(notchHeight+borderRadius*1.6)}
  A ${borderRadius} ${borderRadius} 0 0 ${strokeWidth} ${width - borderRadius} ${height}
  z`;
}

export const DEFAULT_SVG_OPTIONS: SvgContainerOptions = {
  width: 350,
  height: 200,
  borderRadius: 15,
  notchWidth: 50,
  notchHeight: 50,
  strokeColor: "#1543D8", // royal blue
  strokeWidth: 1,
  filter: "", //"neonGlow",
};

export function adjustDimensions(dim: any, maxDim: number) {
  const x = parseInt(dim);
  if (typeof dim == "string")
    dim = dim.endsWith('%') ? (maxDim * x / 100) : x;
  return Math.min(dim, maxDim);
}

export const hexToRgb = (hex: string): [number, number, number] => {
  hex = hex.replace(/^#/, ''); // Remove starting '#'
  if (hex.length === 3) hex = Array.from(hex).map(c => c + c).join(''); // Expand shorthand form

  const bigint = parseInt(hex, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};


// cf. https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
// cf. https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(psbc.js)
function psbcr(d: any) {

  const i = parseInt;
  let n = d.length, x = {} as any;
  if (n > 9) {
    const [r, g, b, a] = (d = d.split(','));
    n = d.length;
    if (n < 3 || n > 4) return null;
    x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4)), x.g = i(g), x.b = i(b), x.a = a ? parseFloat(a) : -1
  } else {
    if (n == 8 || n == 6 || n < 4) return null;
    if (n < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : "");
    d = i(d.slice(1), 16);
    if (n == 9 || n == 5) x.r = d >> 24 & 255, x.g = d >> 16 & 255, x.b = d >> 8 & 255, x.a = Math.round((d & 255) / 0.255) / 1000;
    else x.r = d >> 16, x.g = d >> 8 & 255, x.b = d & 255, x.a = -1
  } return x
}

export function psbc(p: any, c0: any, c1: any = null, l: any = null): string {
  let r, g, b, P, f, t, h, m = Math.round, a = (typeof (c1) == "string") as any;
  if (typeof (p) != "number" || p < -1 || p > 1 || typeof (c0) != "string" || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return "";
  h = c0.length > 9, h = a ? c1.length > 9 ? true : c1 == "c" ? !h : false : h, f = psbcr(c0), P = p < 0, t = c1 && c1 != "c" ? psbcr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }, p = P ? p * -1 : p, P = 1 - p;
  if (!f || !t) return "";
  if (l) r = m(P * f.r + p * t.r), g = m(P * f.g + p * t.g), b = m(P * f.b + p * t.b);
  else r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5), g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5), b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
  a = f.a, t = t.a, f = a >= 0 || t >= 0, a = f ? a < 0 ? t : t < 0 ? a : a * P + t * p : 0;
  if (h) return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
  else return "#" + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2)
}

export const luminance = (r: number, g: number, b: number): number => {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export const hexLuminance = (hex: string): number => {
  return luminance(...hexToRgb(hex));
}

export const isShadeOfGrey = (hex: string, tolerance: number = 10): boolean => {
  const [r, g, b] = hexToRgb(hex);
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
  return maxDiff <= tolerance;
};

export const highHexLuminance = (hex: string, threshold=.08): boolean => {
  const luminanceValue = hexLuminance(hex);
  return luminanceValue < threshold*256 || luminanceValue >= (256 - threshold*256);
}

export const isVeryDark = (hex: string, threshold=.2): boolean =>
  hexLuminance(hex) < (threshold*256);

export const isVeryLight = (hex: string, threshold=.2): boolean =>
  hexLuminance(hex) > (256 - threshold*256);

export const themedBgGradient = (theme: any, color?: string, degrees=180): string => {
  if (!color || highHexLuminance(color))
    color = theme.primary;
  return `(${degrees}deg, ${theme.bg[0]}, ${color})`;
}

export const themedFgGradient = (theme: any, color?: string, degrees=180): string => {
  if (!color || highHexLuminance(color))
    color = theme.primary;
  else
    color = psbc(0.1, color, theme.fg[0])
  return `(${degrees}deg, ${theme.fg[0]}, ${color})`;
}

// TODO: make css variable
// { color: p.apy < 0 ? State.theme.value?.error : State.theme.value?.success }
export const tintedFg = (theme: any, v: number, negative=true): string => {
  if (negative)
    v = Math.max(0, v);
  return v < 0 ? psbc(theme.fg[0], theme.value?.error, .2) : psbc(theme.fg[0], theme.value?.success, .2);
}

export interface IChartLastVal {
  x: number,
  y: number,
  color: string
};

export function getChartLastValPos(chart: Chart, xOffset = 0, yOffset = 0): IChartLastVal[] {
  const allLastValues = chart.data.datasets.map(dataset => {
    const lastValue = dataset.data[dataset.data.length - 1] as number;
    // const yMin = chart.scales.y.min;
    // const yMax = chart.scales.y.max;
    // const yRange = yMax - yMin;
    // const chartArea = chart.chartArea;

    // const normalized = (<number>lastValue - yMin) / yRange;
    // const yPosition = chartArea.bottom - (normalized * (chartArea.bottom - chartArea.top));
    // const xPosition = chartArea.right;

    const yPosition = chart.scales.y.getPixelForValue(lastValue); // cap(chart.scales.y.getPixelForValue(lastValue), -yOffset, chart.chartArea.height);
    const xPosition = chart.scales.x.getPixelForValue(dataset.data.length - 1);
  
    return {
      x: xPosition + xOffset,
      y: yPosition + yOffset,
      color: (dataset.borderColor || dataset.backgroundColor) as string
    };
  });

  return allLastValues;
}

export default {};
