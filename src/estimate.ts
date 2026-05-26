import type { Estimate } from "./types.js";

export interface TokenHeuristic {
  charsPerToken: number;
  lineCost: number;
}

export const defaultHeuristic: TokenHeuristic = {
  charsPerToken: 4,
  lineCost: 0.08
};

export function estimateText(content: string, heuristic = defaultHeuristic): Estimate {
  const chars = content.length;
  const bytes = Buffer.byteLength(content, "utf8");
  const lines = content.length === 0 ? 0 : content.split(/\r\n|\r|\n/).length;
  const lexicalTokens = Math.ceil(chars / heuristic.charsPerToken);
  const structuralTokens = Math.ceil(lines * heuristic.lineCost);

  return {
    bytes,
    chars,
    lines,
    tokens: Math.max(0, lexicalTokens + structuralTokens)
  };
}

export function emptyEstimate(): Estimate {
  return { bytes: 0, chars: 0, lines: 0, tokens: 0 };
}

export function sumEstimates(estimates: Estimate[]): Estimate {
  return estimates.reduce<Estimate>(
    (total, item) => ({
      bytes: total.bytes + item.bytes,
      chars: total.chars + item.chars,
      lines: total.lines + item.lines,
      tokens: total.tokens + item.tokens
    }),
    emptyEstimate()
  );
}
