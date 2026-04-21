import { sql, ensureTables } from './db';

const DAILY_LIMIT = 3;
const RATE_LIMIT_DISABLED = process.env.DISABLE_RATE_LIMIT === 'true';

export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number; resetAt: string }> {
  if (RATE_LIMIT_DISABLED) {
    return { allowed: true, remaining: 999, resetAt: 'never' };
  }

  await ensureTables();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const rows = await sql`
    SELECT scan_count FROM ip_usage
    WHERE ip_address = ${ip} AND date = ${today}
  `;

  const currentCount = (rows[0] as { scan_count: number } | undefined)?.scan_count ?? 0;

  if (currentCount >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: 'tomorrow' };
  }

  await sql`
    INSERT INTO ip_usage (ip_address, date, scan_count, last_scan_at)
    VALUES (${ip}, ${today}, 1, NOW())
    ON CONFLICT (ip_address, date) DO UPDATE
      SET scan_count    = ip_usage.scan_count + 1,
          last_scan_at  = NOW()
  `;

  return {
    allowed: true,
    remaining: DAILY_LIMIT - currentCount - 1,
    resetAt: 'tomorrow',
  };
}

export function getClientIP(headers: Headers): string {
  return (
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1'
  );
}
