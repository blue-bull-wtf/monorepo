import { marked as MD, MarkedOptions } from "marked";

// MARDOWN
const defaultMdParserOptions: MarkedOptions = { gfm: true, pedantic: false, breaks: true };

export function toMarkdown(s: string, o: Partial<MarkedOptions>={}): string {
  o = { ...defaultMdParserOptions, ...o };
  const tokens = MD.lexer(s);
  return MD.parser(tokens, defaultMdParserOptions)
}

export async function parseMarkdown(s: string, o: Partial<MarkedOptions>=defaultMdParserOptions): Promise<string> {
  return await MD.parse(s, o);
}
