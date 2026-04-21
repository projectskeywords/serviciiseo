import { neon } from '@neondatabase/serverless';

// Support both Vercel Neon integration env names
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED;

if (!connectionString) {
  console.error('[DB] No DATABASE_URL environment variable found!');
}

// Export sql — if no connection string, queries will throw (handled gracefully in routes)
export const sql = connectionString
  ? neon(connectionString)
  : (() => { throw new Error('DATABASE_URL not configured'); }) as never;

let initialized = false;

export async function ensureTables(): Promise<void> {
  if (initialized) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id                  BIGSERIAL PRIMARY KEY,
        website_url         TEXT NOT NULL,
        email               TEXT NOT NULL,
        category            TEXT,
        language            TEXT DEFAULT 'ro',
        ip_address          TEXT,
        user_agent          TEXT,
        status              TEXT DEFAULT 'pending',
        created_at          TIMESTAMPTZ DEFAULT NOW(),
        completed_at        TIMESTAMPTZ,
        score_overall       INTEGER,
        score_performance   INTEGER,
        score_seo           INTEGER,
        score_accessibility INTEGER,
        score_best_practices INTEGER,
        fcp TEXT, lcp TEXT, tbt TEXT,
        rank_position       INTEGER,
        rank_total          INTEGER,
        competitors_json    TEXT
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS ip_usage (
        ip_address   TEXT NOT NULL,
        date         TEXT NOT NULL,
        scan_count   INTEGER DEFAULT 0,
        last_scan_at TIMESTAMPTZ,
        PRIMARY KEY (ip_address, date)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        token      TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_email   ON leads(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ip_usage      ON ip_usage(ip_address, date)`;

    // Cleanup stale rate-limit rows
    await sql`DELETE FROM ip_usage WHERE date < (CURRENT_DATE - INTERVAL '7 days')::TEXT`;

    initialized = true;
  } catch (err) {
    console.error('[DB] ensureTables error:', err);
    // Don't set initialized = true so we retry next request
  }
}
