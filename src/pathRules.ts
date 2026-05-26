import path from "node:path";
import { minimatch } from "minimatch";

const generatedSegments = [
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".git",
  ".next",
  ".turbo",
  ".cache"
];

const lockfileNames = new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lock",
  "Cargo.lock",
  "Gemfile.lock",
  "poetry.lock"
]);

const sourceExtensions = new Set([
  ".c",
  ".cc",
  ".cpp",
  ".cs",
  ".css",
  ".go",
  ".java",
  ".js",
  ".jsx",
  ".kt",
  ".mjs",
  ".py",
  ".rb",
  ".rs",
  ".sh",
  ".swift",
  ".ts",
  ".tsx"
]);

export function normalizePath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

export function isGeneratedPath(filePath: string): boolean {
  const parts = normalizePath(filePath).split("/");
  return parts.some((part) => generatedSegments.includes(part));
}

export function isLockfile(filePath: string): boolean {
  return lockfileNames.has(path.basename(filePath));
}

export function isLogFile(filePath: string): boolean {
  const normalized = normalizePath(filePath).toLowerCase();
  return normalized.endsWith(".log") || normalized.includes("/logs/");
}

export function isMarkdown(filePath: string): boolean {
  return [".md", ".mdx", ".markdown"].includes(path.extname(filePath).toLowerCase());
}

export function isJson(filePath: string): boolean {
  return path.extname(filePath).toLowerCase() === ".json";
}

export function isSource(filePath: string): boolean {
  return sourceExtensions.has(path.extname(filePath).toLowerCase());
}

export function matchesAny(filePath: string, patterns: string[]): boolean {
  const normalized = normalizePath(filePath);
  return patterns.some((pattern) => minimatch(normalized, pattern, { dot: true }));
}
