# ctxshrink

ctxshrink is an early-stage local-first utility for estimating and reducing
large context bundles before they are handed to an agent or review workflow.

## Status

This repository is early-stage. Confirm the current support, release, and
security posture before using it in production.

## Install

The npm registry does not contain a release yet. Until the first tagged release
is published, install from a pinned source checkout:

```sh
npm ci
npm run build
npm link
```

After a tagged release is available on npm, install the registry package with
`npm install --global ctxshrink@<version>`. Do not treat `npm install` in a
source checkout as a registry installation: it installs this repository's
development dependencies and requires a separate build.

## Quickstart

Run the maintained checks and the fixture-backed smoke from a checkout:

```sh
npm run build
node dist/src/cli.js --help
npm test
npm run release:check
```

The package exposes a `ctxshrink` binary from the built `dist` output. Until
the CLI has broader fixture coverage, prefer running it from a pinned checkout
and keep generated manifests under review.

After installing the package, verify the installed command and run the same
local estimate path:

```sh
ctxshrink --help
ctxshrink --version
ctxshrink estimate README.md
ctxshrink estimate README.md --json
```

## Verify

Run the local validation script before opening a pull request:

```sh
bash scripts/validate.sh
```

`scripts/validate.sh` runs the repository's standard local checks when they are
defined and will also run `agent-qc ready` when `agent-qc` is installed.
Missing `agent-qc` is treated as a skip, not a failure.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Changes
should be small, reviewable, and verified before review.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance. Do not
paste private source, prompts, credentials, or proprietary context bundles into
public issues.

## License

MIT

## Development

Use the published verification scripts before opening a release PR:

- `npm run audit` - fails on high- or critical-severity dependency advisories
- `npm run check` - tsc -p tsconfig.json --noEmit
- `npm run test` - vitest run
- `npm run build` - tsc -p tsconfig.json
- `npm run smoke` - bash scripts/smoke.sh
- `npm run package:smoke` - builds the package, inspects the npm tarball, and imports the public API
- `npm run release:metadata -- --tag v0.1.0` - checks the tag/version invariant, trusted-publishing workflow metadata, release ordering, and publish command without publishing
- `npm run release:check` - runs the dependency audit, type check, tests, build, smoke test, package smoke test, and release metadata check

`npm run release:check` is the broadest local readiness check when it is available.
