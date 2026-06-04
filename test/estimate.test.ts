import { describe, it, expect } from "vitest";
import { estimateText, sumEstimates, emptyEstimate } from "../src/estimate.js";

describe("estimateText", () => {
  it("estimates empty string", () => {
    const est = estimateText("");
    expect(est.bytes).toBe(0);
    expect(est.chars).toBe(0);
    expect(est.lines).toBe(0);
    expect(est.tokens).toBe(0);
  });

  it("estimates a simple line", () => {
    const est = estimateText("hello world");
    expect(est.chars).toBe(11);
    expect(est.lines).toBe(1);
    expect(est.tokens).toBeGreaterThan(0);
  });

  it("estimates multi-line content", () => {
    const content = "line one\nline two\nline three";
    const est = estimateText(content);
    expect(est.lines).toBe(3);
    expect(est.chars).toBe(content.length);
  });

  it("handles non-ASCII content bytes", () => {
    const content = "hello 世界";
    const est = estimateText(content);
    expect(est.bytes).toBeGreaterThan(est.chars);
  });
});

describe("sumEstimates", () => {
  it("sums multiple estimates", () => {
    const result = sumEstimates([
      { bytes: 100, chars: 100, lines: 5, tokens: 25 },
      { bytes: 200, chars: 200, lines: 10, tokens: 50 },
    ]);
    expect(result.bytes).toBe(300);
    expect(result.chars).toBe(300);
    expect(result.lines).toBe(15);
    expect(result.tokens).toBe(75);
  });

  it("handles empty array", () => {
    const result = sumEstimates([]);
    expect(result).toEqual({ bytes: 0, chars: 0, lines: 0, tokens: 0 });
  });
});

describe("emptyEstimate", () => {
  it("returns all zeros", () => {
    const est = emptyEstimate();
    expect(est.bytes).toBe(0);
    expect(est.chars).toBe(0);
    expect(est.lines).toBe(0);
    expect(est.tokens).toBe(0);
  });
});
