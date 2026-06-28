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
