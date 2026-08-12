All notable changes to this project will be documented in this file.

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
format and uses semantic versioning when versioned releases are published.

## [Unreleased]

### Changed

- Update the Vitest development toolchain so clean installs use a patched nanoid release without the high-severity advisory.
- Reject invalid custom token heuristics instead of returning non-finite estimates.

### Added

- Initial project setup.
- Release readiness: document local verification, npm package metadata, and pack contents for the next public release.
- Release readiness: add fixture-backed Vitest coverage for context estimates and aggregate totals.
- Release readiness: add CLI regression coverage for stdin JSON, file JSON, and unreadable input errors.
- Release readiness: inspect the npm tarball during package smoke checks so missing bin, API, type, license, security, or changelog files fail before publishing.
- Release readiness: validate tag and registry availability before publishing a provenance-bearing npm tarball, then create the GitHub release only after npm succeeds.

## Installation contract

No registry release exists yet. Install the current code from a pinned source
checkout with `npm ci && npm run build && npm link`. Once a version is tagged
and published, install that exact registry artifact with
`npm install --global ctxshrink@<version>`. Maintainers verify the complete
source and package path with `npm run release:check`.

## Release Links

- Unreleased commits: `https://github.com/rogerchappel/ctxshrink/commits/main`
- Releases: `https://github.com/rogerchappel/ctxshrink/releases`
