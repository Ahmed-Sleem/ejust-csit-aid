#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
echo '== secret scan =='; if grep -RInE --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist '(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----)' .; then exit 1; fi
echo '== unit tests =='; npm run test
echo '== database tests =='; npm run db:test
echo '== dependency audit =='; npm audit --audit-level=high
echo '== build =='; npm run build
echo '== browser tests =='; npm run test:e2e
echo 'Verification complete.'
