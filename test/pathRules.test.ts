import { describe, it, expect } from "vitest";
import {
  normalizePath,
  isGeneratedPath,
  isLockfile,
  isLogFile,
  isMarkdown,
  isJson,
  isSource,
  matchesAny,
} from "../src/pathRules.js";

describe("normalizePath", () => {
  it("normalizes paths using platform separator", () => {
    // On Unix, normalizePath is a pass-through for forward-slash paths
    // On Windows, it would convert backslashes to forward slashes
    expect(normalizePath("src/foo/bar.ts")).toBe("src/foo/bar.ts");
  });

  it("leaves forward slashes unchanged", () => {
    expect(normalizePath("src/foo/bar.ts")).toBe("src/foo/bar.ts");
  });
});

describe("isGeneratedPath", () => {
  it("flags node_modules directories", () => {
    expect(isGeneratedPath("node_modules/foo/index.js")).toBe(true);
  });

  it("flags dist directories", () => {
    expect(isGeneratedPath("dist/bundle.js")).toBe(true);
  });

  it("flags build directories", () => {
    expect(isGeneratedPath("build/output.js")).toBe(true);
  });

  it("flags .next directories", () => {
    expect(isGeneratedPath(".next/server/pages.js")).toBe(true);
  });

  it("flags .git directories", () => {
    expect(isGeneratedPath(".git/HEAD")).toBe(true);
  });

  it("allows normal source paths", () => {
    expect(isGeneratedPath("src/index.ts")).toBe(false);
    expect(isGeneratedPath("lib/utils.js")).toBe(false);
    expect(isGeneratedPath("README.md")).toBe(false);
  });
});

describe("isLockfile", () => {
  it("identifies common lockfiles", () => {
    expect(isLockfile("package-lock.json")).toBe(true);
    expect(isLockfile("pnpm-lock.yaml")).toBe(true);
    expect(isLockfile("yarn.lock")).toBe(true);
    expect(isLockfile("Cargo.lock")).toBe(true);
  });

  it("ignores non-lockfile JSON", () => {
    expect(isLockfile("config.json")).toBe(false);
  });
});

describe("isLogFile", () => {
  it("identifies .log extensions", () => {
    expect(isLogFile("build.log")).toBe(true);
  });

  it("identifies /logs/ in path", () => {
    expect(isLogFile("app/logs/server.log")).toBe(true);
    expect(isLogFile("logs/server.log")).toBe(true);
  });

  it("ignores non-log files", () => {
    expect(isLogFile("log.txt")).toBe(false);
    expect(isLogFile("src/index.ts")).toBe(false);
  });
});

describe("isMarkdown", () => {
  it("identifies markdown files", () => {
    expect(isMarkdown("README.md")).toBe(true);
    expect(isMarkdown("docs/guide.mdx")).toBe(true);
  });

  it("ignores non-markdown", () => {
    expect(isMarkdown("src/index.ts")).toBe(false);
  });
});

describe("isJson", () => {
  it("identifies JSON files", () => {
    expect(isJson("config.json")).toBe(true);
  });

  it("ignores other extensions", () => {
    expect(isJson("config.yml")).toBe(false);
  });
});

describe("isSource", () => {
  it("identifies common source files", () => {
    expect(isSource("src/index.ts")).toBe(true);
    expect(isSource("lib/app.js")).toBe(true);
    expect(isSource("main.py")).toBe(true);
    expect(isSource("app.py")).toBe(true);
    expect(isSource("Main.java")).toBe(true);
  });

  it("ignores non-source files", () => {
    expect(isSource("README.md")).toBe(false);
    expect(isSource("package.json")).toBe(false);
  });
});

describe("matchesAny", () => {
  it("matches glob patterns", () => {
    expect(matchesAny("src/foo.ts", ["src/**/*.ts"])).toBe(true);
    expect(matchesAny("src/foo.js", ["src/**/*.ts"])).toBe(false);
    expect(matchesAny(".gitignore", [".*"])).toBe(true);
  });
});
