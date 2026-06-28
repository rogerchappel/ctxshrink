# ctxshrink

ctxshrink is an early-stage local-first utility for estimating and reducing
large context bundles before they are handed to an agent or review workflow.

## Status

This repository is early-stage. Confirm the current support, release, and
security posture before using it in production.

## Install

Install dependencies from a checkout:

```sh
npm install
npm run build
```

## Use

Run the maintained checks while the CLI surface is still settling:

```sh
npm test
npm run release:check
```

The package exposes a `ctxshrink` binary from the built `dist` output. Until
the CLI has broader fixture coverage, prefer running it from a pinned checkout
and keep generated manifests under review.

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

- `npm run check` - tsc -p tsconfig.json --noEmit
- `npm run test` - vitest run
- `npm run build` - tsc -p tsconfig.json
- `npm run smoke` - bash scripts/smoke.sh
- `npm run package:smoke` - npm pack --dry-run
- `npm run release:check` - npm run check && npm test && npm run build && npm run smoke && npm run package:smoke

`npm run release:check` is the broadest local readiness check when it is available.
