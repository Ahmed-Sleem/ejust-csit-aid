# Data model

The canonical schema is the ordered SQL in [`migrations/`](../migrations). Migrations are immutable after release and are applied with a direct (non-pooled) PostgreSQL connection by `scripts/migrate.sh`.

## Ownership boundaries

- Managed Better Auth owns identities, passwords, sessions, verification, and reset tokens.
- `profiles.user_id` stores the stable auth identity and is the application authorization key.
- Academic role (`student` or `professor`) is separate from `admin_privileges`.
- `project_count` is never stored; it is derived from published project mentions.
- Audit history is append-only and must never contain credentials, tokens, verification codes, or passwords.

## Core relationships

- A profile may have an active admin privilege; only one active root privilege can exist.
- A project belongs to its creator and mentions profiles through `project_people`.
- Publications belong to profiles and may reference a project.
- Upload metadata belongs to a profile identity; storage objects are external.

## Migration discipline

1. Never edit a migration already applied outside a disposable local database.
2. Add a new, forward-only migration for every change.
3. Run `npm run db:test` against a fresh PostgreSQL instance.
4. Test upgrades on a Neon development branch before production.
5. Use an unpooled connection for DDL and backups.
