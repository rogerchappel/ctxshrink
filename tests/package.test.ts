import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("package.json engines field", () => {
  it("declares compatible Node runtime engines", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    expect(pkg.engines).toBeDefined();
    expect(pkg.engines.node).toBe(">=20");
  });
});
