import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { emptyEstimate, estimateText, sumEstimates } from "../src/index.js";

describe("estimateText", () => {
  it("returns deterministic counts for fixture-style context", () => {
    const content = readFileSync("tests/fixtures/basic-context.md", "utf8");

    expect(estimateText(content)).toEqual({
      bytes: Buffer.byteLength(content, "utf8"),
      chars: content.length,
      lines: 7,
      tokens: 44
    });
  });

  it("handles empty input without synthetic token cost", () => {
    expect(estimateText("")).toEqual(emptyEstimate());
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects invalid charsPerToken value %s",
    (charsPerToken) => {
      expect(() => estimateText("context", { charsPerToken, lineCost: 0.08 })).toThrow(
        new RangeError("charsPerToken must be a finite number greater than 0")
      );
    }
  );

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects invalid lineCost value %s",
    (lineCost) => {
      expect(() => estimateText("context", { charsPerToken: 4, lineCost })).toThrow(
        new RangeError("lineCost must be a finite, non-negative number")
      );
    }
  );

  it.each([
    { heuristic: { charsPerToken: 0.5, lineCost: 0 }, tokens: 6 },
    { heuristic: { charsPerToken: Number.MIN_VALUE, lineCost: 0 }, tokens: 0 },
    { heuristic: { charsPerToken: 2.5, lineCost: 0.25 }, tokens: 3 }
  ])("accepts safe boundary and fractional heuristic $heuristic", ({ heuristic, tokens }) => {
    const estimate = estimateText(heuristic.charsPerToken === Number.MIN_VALUE ? "" : "abc", heuristic);

    expect(estimate.tokens).toBe(tokens);
    expect(Object.values(estimate).every((value) => Number.isFinite(value) && value >= 0)).toBe(true);
  });
});

describe("sumEstimates", () => {
  it("combines multiple file estimates for manifest totals", () => {
    const total = sumEstimates([
      estimateText("alpha\nbeta"),
      estimateText("release gate")
    ]);

    expect(total).toEqual({
      bytes: 22,
      chars: 22,
      lines: 3,
      tokens: 8
    });
  });
});
