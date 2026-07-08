import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const cliPath = join(process.cwd(), "dist", "src", "cli.js");

beforeAll(() => {
  if (!existsSync(cliPath)) {
    execFileSync("npm", ["run", "build"], { stdio: "inherit" });
  }
});

describe("ctxshrink CLI", () => {
  it("estimates stdin as JSON", () => {
    const result = spawnSync(process.execPath, [cliPath, "estimate", "--json"], {
      input: "alpha beta gamma\n",
      encoding: "utf8"
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");

    const parsed = JSON.parse(result.stdout);
    expect(parsed.inputs).toHaveLength(1);
    expect(parsed.inputs[0].path).toBe("stdin");
    expect(parsed.inputs[0].estimate.tokens).toBeGreaterThan(0);
    expect(parsed.total.lines).toBe(2);
  });

  it("estimates a file path as JSON", () => {
    const fixtureDir = mkdtempSync(join(tmpdir(), "ctxshrink-cli-"));
    const fixturePath = join(fixtureDir, "context.md");
    writeFileSync(fixturePath, "# Context\n\nA short handoff note.\n", "utf8");

    try {
      const result = spawnSync(process.execPath, [cliPath, "estimate", fixturePath, "--json"], {
        encoding: "utf8"
      });

      expect(result.status).toBe(0);
      expect(result.stderr).toBe("");

      const parsed = JSON.parse(result.stdout);
      expect(parsed.inputs).toHaveLength(1);
      expect(parsed.inputs[0].path).toBe(fixturePath);
      expect(parsed.inputs[0].estimate.lines).toBe(4);
      expect(parsed.total.bytes).toBeGreaterThan(0);
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true });
    }
  });

  it("reports unreadable files as CLI errors", () => {
    const missingPath = join(tmpdir(), "ctxshrink-missing-input.md");
    const result = spawnSync(process.execPath, [cliPath, "estimate", missingPath], {
      encoding: "utf8"
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("ctxshrink:");
    expect(result.stderr).toContain(missingPath);
  });
});
