import db from './db';

const DAILY_LIMIT = 3;
// Set DISABLE_RATE_LIMIT=true in .env.local to bypass for testing
const RATE_LIMIT_DISABLED = process.env.DISABLE_RATE_LIMIT === 'true';

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: string } {
  if (RATE_LIMIT_DISABLED) {
    return { allowed: true, remaining: 999, resetAt: 'never' };
  }

  const today = new Date().toISOString().split('T')[0];

  const row = db.prepare(
    `SELECT scan_count FROM ip_usage WHERE ip_address = ? AND date = ?`
  ).get(ip, today) as { scan_count: number } | undefined;

  const currentCount = row?.scan_count ?? 0;

  if (currentCount >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: 'tomorrow' };
  }

  db.prepare(`
    INSERT INTO ip_usage (ip_address, date, scan_count, last_scan_at)
    VALUES (?, ?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(ip_address, date) DO UPDATE SET
      scan_count = scan_count + 1,
      last_scan_at = CURRENT_TIMESTAMP
  `).run(ip, today);

  return { allowed: true, remaining: DAILY_LIMIT - currentCount - 1, resetAt: 'tomorrow' };
}

export function getClientIP(headers: Headers): string {
  return (
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1'
  );
}
