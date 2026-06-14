#!/usr/bin/env node
import fs from "node:fs/promises";
import process from "node:process";
import { Command } from "commander";
import { estimateText, sumEstimates } from "./estimate.js";
import type { Estimate } from "./types.js";

interface InputEstimate {
  path: string;
  estimate: Estimate;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function printText(items: InputEstimate[], total: Estimate): void {
  for (const item of items) {
    console.log(
      `${item.path}: ${item.estimate.tokens} tokens, ${item.estimate.lines} lines, ${item.estimate.bytes} bytes`
    );
  }
  console.log(`total: ${total.tokens} tokens, ${total.lines} lines, ${total.bytes} bytes`);
}

const program = new Command();

program
  .name("ctxshrink")
  .description("Estimate context size before handing it to an agent or review workflow.")
  .version("0.1.0");

program
  .command("estimate")
  .description("Estimate token cost for files, or stdin when no files are provided.")
  .argument("[files...]", "Files to estimate")
  .option("--json", "Print JSON output")
  .action(async (files: string[], options: { json?: boolean }) => {
    const inputs: InputEstimate[] = [];

    if (files.length === 0) {
      const content = await readStdin();
      inputs.push({ path: "stdin", estimate: estimateText(content) });
    } else {
      for (const file of files) {
        const content = await fs.readFile(file, "utf8");
        inputs.push({ path: file, estimate: estimateText(content) });
      }
    }

    const total = sumEstimates(inputs.map((input) => input.estimate));
    if (options.json) {
      console.log(JSON.stringify({ inputs, total }, null, 2));
      return;
    }

    printText(inputs, total);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`ctxshrink: ${message}`);
  process.exitCode = 1;
});
