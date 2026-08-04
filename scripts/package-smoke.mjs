import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  encoding: "utf8"
});

const [pack] = JSON.parse(output);
const packedFiles = new Set(pack.files.map((file) => file.path));
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

const requiredFiles = [
  "package.json",
  "dist/src/cli.js",
  "dist/src/index.js",
  "dist/src/index.d.ts",
  "examples/basic-context.md",
  "README.md",
  "LICENSE",
  "SECURITY.md",
  "CHANGELOG.md"
];

const missing = requiredFiles.filter((file) => !packedFiles.has(file));
if (missing.length > 0) {
  console.error(`Package smoke failed; missing files:\n${missing.join("\n")}`);
  process.exit(1);
}

const declaredBins = Object.values(packageJson.bin ?? {}).map((binPath) =>
  binPath.replace(/^.\//, "")
);
const missingBins = declaredBins.filter((binPath) => !packedFiles.has(binPath));
if (missingBins.length > 0) {
  console.error(`Package smoke failed; missing declared bins:\n${missingBins.join("\n")}`);
  process.exit(1);
}

console.log(`package smoke ok: ${pack.filename} includes ${pack.files.length} files`);

const installDirectory = mkdtempSync(join(tmpdir(), "ctxshrink-package-smoke-"));
try {
  const packOutput = execFileSync(
    "npm",
    ["pack", "--json", "--pack-destination", installDirectory],
    { encoding: "utf8" }
  );
  const [packed] = JSON.parse(packOutput);
  const tarball = join(installDirectory, packed.filename);

  execFileSync("npm", ["install", "--ignore-scripts", tarball], {
    cwd: installDirectory,
    stdio: "pipe"
  });

  const command = join(installDirectory, "node_modules", ".bin", "ctxshrink");
  const estimateOutput = execFileSync(command, ["estimate", "README.md", "--json"], {
    cwd: process.cwd(),
    encoding: "utf8"
  });
  const estimate = JSON.parse(estimateOutput);
  if (estimate.inputs?.[0]?.path !== "README.md") {
    throw new Error("installed ctxshrink estimate command returned unexpected output");
  }

  const obsoleteCommand = spawnSync(command, ["summarize", "README.md"], {
    cwd: process.cwd(),
    encoding: "utf8"
  });
  if (obsoleteCommand.status === 0) {
    throw new Error("obsolete ctxshrink summarize command unexpectedly succeeded");
  }

  console.log("installed CLI smoke ok: estimate succeeds and summarize is rejected");
} finally {
  rmSync(installDirectory, { recursive: true, force: true });
}
