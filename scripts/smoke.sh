#!/usr/bin/env bash
set -euo pipefail

npm run build
node dist/src/cli.js --help >/dev/null
printf 'alpha beta gamma\n' | node dist/src/cli.js estimate --json | grep '"path": "stdin"'
node dist/src/cli.js estimate examples/basic-context.md --json | grep '"path": "examples/basic-context.md"'
node dist/src/cli.js estimate examples/basic-context.md | grep '^total: '
