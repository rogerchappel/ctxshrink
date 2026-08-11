#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import process from 'node:process';

const root = new URL('../', import.meta.url);
const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const workflow = await readFile(new URL('.github/workflows/release.yml', root), 'utf8');
const args = new Map();

for (let index = 2; index < process.argv.length; index += 1) {
  const argument = process.argv[index];
  if (!argument.startsWith('--')) throw new Error(`Unknown argument: ${argument}`);
  const [key, inlineValue] = argument.split('=', 2);
  if (inlineValue !== undefined) args.set(key, inlineValue);
  else if (process.argv[index + 1] && !process.argv[index + 1].startsWith('--')) {
    args.set(key, process.argv[index + 1]);
    index += 1;
  } else args.set(key, true);
}

const tag = args.get('--tag') || process.env.GITHUB_REF_NAME;
if (!tag) throw new Error('Pass --tag v<package-version> or set GITHUB_REF_NAME.');

const expectedTag = `v${packageJson.version}`;
if (tag !== expectedTag) {
  throw new Error(`Release tag ${tag} does not match package.json version ${packageJson.version} (expected ${expectedTag}).`);
}

const requiredWorkflowFragments = [
  'contents: write',
  'id-token: write',
  'npm publish "${{ steps.pack.outputs.tarball }}" --provenance --access public',
  'gh release create "${GITHUB_REF_NAME}"',
];
for (const fragment of requiredWorkflowFragments) {
  if (!workflow.includes(fragment)) throw new Error(`Release workflow is missing: ${fragment}`);
}

const publishIndex = workflow.indexOf('npm publish');
const githubReleaseIndex = workflow.indexOf('gh release create');
if (publishIndex > githubReleaseIndex) {
  throw new Error('The npm package must be published before the GitHub release is created.');
}

const response = args.has('--check-registry')
  ? await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageJson.name)}/${encodeURIComponent(packageJson.version)}`)
  : null;
if (response?.ok) {
  throw new Error(`${packageJson.name}@${packageJson.version} already exists on npm; refusing to create a partial release.`);
}
if (response && response.status !== 404) {
  throw new Error(`Unable to verify npm availability: ${response.status} ${response.statusText}`);
}

console.log(`Release metadata valid for ${packageJson.name}@${packageJson.version} (${tag}).`);
if (response?.status === 404) console.log('npm version is available.');
