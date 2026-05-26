# CtxShrink PRD

Status: in-progress

## Summary

CtxShrink is a local-first context budgeter for agent prompts. It reads files, globs, or stdin, estimates token cost, applies deterministic reducers, and writes a smaller context bundle with an audit trail of what was kept, summarized structurally, or dropped.

## Problem

Coding agents now support large contexts, but dumping a whole repo into a prompt is still wasteful and can hide the important bits. Developers need a transparent, offline way to shrink context before pasting it into a terminal agent or saving it as a task artifact.

## Goals

- Estimate context size using configurable token heuristics.
- Keep high-signal files based on path rules, git status, imports, and headings.
- Collapse low-signal content such as lockfiles, generated output, comments-only files, and repeated logs.
- Produce a bundle plus a manifest explaining every reduction.
- Include tests that prove reductions are deterministic.

## Non-Goals

- No LLM summarization in V1.
- No editor extension.
- No remote storage.

## CLI

```bash
ctxshrink pack src docs --budget 12000 --out tmp/context.md
ctxshrink estimate README.md src/**/*.ts
ctxshrink explain tmp/context.manifest.json
```

## MVP Requirements

- TypeScript Node CLI with `pack`, `estimate`, and `explain` commands.
- Glob loading, stdin support, ignore rules, and stable ordering.
- Reducers for Markdown, JSON, source files, logs, and lockfiles.
- Fixture-backed tests and a smoke script.
- README with examples for Codex/Claude/Gemini handoffs.

## Attribution

Inspired by current agent-context products and research on local-first AI engineering command centers, but scoped down to a deterministic context shrinker with no model dependency.
