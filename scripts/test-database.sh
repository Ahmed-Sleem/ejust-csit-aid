#!/usr/bin/env bash
set -Eeuo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PATH="$(pg_config --bindir):$PATH"
port="${PGTEST_PORT:-55432}"
data="$(mktemp -d)"
cleanup() { pg_ctl -D "$data" -m fast stop >/dev/null 2>&1 || true; rm -rf "$data"; }
trap cleanup EXIT
initdb -D "$data" --encoding=UTF8 --locale=C.UTF-8 --auth=trust --no-instructions >/dev/null
pg_ctl -D "$data" -l "$data/postgres.log" -o "-h 127.0.0.1 -k $data -p $port" -w start >/dev/null || { cat "$data/postgres.log" >&2; exit 1; }
url="postgresql://$(id -un)@127.0.0.1:$port/postgres"
DATABASE_URL="$url" "$root/scripts/migrate.sh"
DATABASE_URL="$url" "$root/scripts/migrate.sh"
psql "$url" -X -v ON_ERROR_STOP=1 -f "$root/tests/database/foundation.sql"
count="$(psql "$url" -XAtqc 'SELECT count(*) FROM public.schema_migrations')"
[[ "$count" == "3" ]] || { echo "expected 3 migrations, got $count" >&2; exit 1; }
echo "database foundation checks passed"
