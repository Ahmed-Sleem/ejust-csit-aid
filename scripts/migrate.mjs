import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL must be a direct, non-pooled PostgreSQL connection string');

const root = path.resolve(import.meta.dirname, '..');
const directory = path.join(root, 'migrations');
const files = (await readdir(directory)).filter((file) => /^\d{4}_[a-z0-9_]+\.sql$/.test(file)).sort();
if (files.length === 0) throw new Error('No migration files found');

const client = new pg.Client({ connectionString: databaseUrl, application_name: 'ejust-schema-migrator' });
await client.connect();
try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      version text PRIMARY KEY,
      checksum text NOT NULL CHECK (checksum ~ '^[a-f0-9]{64}$'),
      applied_at timestamptz NOT NULL DEFAULT statement_timestamp()
    );
    REVOKE ALL ON public.schema_migrations FROM PUBLIC;
  `);
  await client.query("SELECT pg_advisory_lock(hashtext('ejust-csit-aid-schema-migrations'))");
  try {
    for (const version of files) {
      const sql = await readFile(path.join(directory, version), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const applied = await client.query('SELECT checksum FROM public.schema_migrations WHERE version = $1', [version]);
      if (applied.rowCount) {
        if (applied.rows[0].checksum !== checksum) throw new Error(`Checksum mismatch for applied migration ${version}`);
        console.log(`already applied: ${version}`);
        continue;
      }
      console.log(`applying: ${version}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO public.schema_migrations(version, checksum) VALUES ($1, $2)', [version, checksum]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(hashtext('ejust-csit-aid-schema-migrations'))");
  }
} finally {
  await client.end();
}
