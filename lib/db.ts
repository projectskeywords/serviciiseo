import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || './data/leads.db';
const dbDir = path.dirname(DB_PATH);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    website_url TEXT NOT NULL,
    email TEXT NOT NULL,
    category TEXT,
    language TEXT DEFAULT 'ro',
    ip_address TEXT,
    user_agent TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    score_overall INTEGER,
    score_performance INTEGER,
    score_seo INTEGER,
    score_accessibility INTEGER,
    score_best_practices INTEGER,
    fcp TEXT,
    lcp TEXT,
    tbt TEXT,
    rank_position INTEGER,
    rank_total INTEGER,
    competitors_json TEXT
  );

  CREATE TABLE IF NOT EXISTS ip_usage (
    ip_address TEXT NOT NULL,
    date TEXT NOT NULL,
    scan_count INTEGER DEFAULT 0,
    last_scan_at DATETIME,
    PRIMARY KEY (ip_address, date)
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    token TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
  CREATE INDEX IF NOT EXISTS idx_ip_usage ON ip_usage(ip_address, date);
`);

// Cleanup old ip_usage records on startup
db.prepare(`DELETE FROM ip_usage WHERE date < date('now', '-7 days')`).run();

export default db;
