import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(process.env.DATABASE_URL);

// In-memory flag — avoids re-running CREATE IF NOT EXISTS on every call
// within the same serverless instance lifetime
let initialized = false;

export async function ensureTables(): Promise<void> {
  if (initialized) return;

  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id          BIGSERIAL PRIMARY KEY,
      website_url TEXT NOT NULL,
      email       TEXT NOT NULL,
      category    TEXT,
      language    TEXT DEFAULT 'ro',
      ip_address  TEXT,
      user_agent  TEXT,
      status      TEXT DEFAULT 'pending',
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      score_overall       INTEGER,
      score_performance   INTEGER,
      score_seo           INTEGER,
      score_accessibility INTEGER,
      score_best_practices INTEGER,
      fcp TEXT,
      lcp TEXT,
      tbt TEXT,
      rank_position INTEGER,
      rank_total    INTEGER,
      competitors_json TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ip_usage (
      ip_address TEXT NOT NULL,
      date       TEXT NOT NULL,
      scan_count INTEGER DEFAULT 0,
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

  // Clean old rate-limit rows (>7 days)
  await sql`DELETE FROM ip_usage WHERE date < (CURRENT_DATE - INTERVAL '7 days')::TEXT`;

  initialized = true;
}
