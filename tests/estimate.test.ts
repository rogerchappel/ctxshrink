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

  it("rejects heuristics that overflow token arithmetic for non-empty content", () => {
    expect(() => estimateText("a", { charsPerToken: Number.MIN_VALUE, lineCost: 0 })).toThrow(
      new RangeError("heuristic produces a non-finite token estimate for this content")
    );
  });

  it("serializes successful estimates without replacing non-finite values", () => {
    const estimate = estimateText("a", { charsPerToken: 1, lineCost: Number.MAX_VALUE });

    expect(JSON.parse(JSON.stringify(estimate))).toEqual(estimate);
    expect(Object.values(estimate).every(Number.isFinite)).toBe(true);
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

  it.each([
    ["negative", { bytes: -1, chars: 0, lines: 0, tokens: 0 }, "estimate[0].bytes"],
    ["NaN", { bytes: 0, chars: Number.NaN, lines: 0, tokens: 0 }, "estimate[0].chars"],
    ["infinite", { bytes: 0, chars: 0, lines: Number.POSITIVE_INFINITY, tokens: 0 }, "estimate[0].lines"]
  ])("rejects %s public estimate operands", (_case, estimate, field) => {
    expect(() => sumEstimates([estimate])).toThrow(
      new RangeError(`${field} must be a finite, non-negative number`)
    );
  });

  it("rejects aggregate overflow instead of producing JSON nulls", () => {
    const maximum = {
      bytes: Number.MAX_VALUE,
      chars: Number.MAX_VALUE,
      lines: Number.MAX_VALUE,
      tokens: Number.MAX_VALUE
    };

    expect(() => sumEstimates([maximum, maximum])).toThrow(
      new RangeError("sumEstimates overflowed bytes")
    );
  });
});
