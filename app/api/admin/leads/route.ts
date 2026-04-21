import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { sql, ensureTables } from '@/lib/db';

// Helper for dynamic parameterized queries (neon tagged template API is static-only by TS types)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rawSql = sql as unknown as (query: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;

export async function GET(req: NextRequest) {
  await ensureTables();

  const token = req.cookies.get('admin_token')?.value || '';
  if (!(await validateSession(token))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get('page')   || '1'));
  const limit  = 20;
  const offset = (page - 1) * limit;
  const from   = searchParams.get('from')   || '';
  const to     = searchParams.get('to')     || '';
  const lang   = searchParams.get('lang')   || '';
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  // Build parameterized WHERE clause for Postgres ($1, $2, ...)
  const conditions: string[] = [];
  const params: unknown[] = [];

  function p(value: unknown): string {
    params.push(value);
    return `$${params.length}`;
  }

  if (from)   conditions.push(`DATE(created_at) >= ${p(from)}`);
  if (to)     conditions.push(`DATE(created_at) <= ${p(to)}`);
  if (lang)   conditions.push(`language = ${p(lang)}`);
  if (status) conditions.push(`status = ${p(status)}`);
  if (search) {
    const like = `%${search}%`;
    conditions.push(`(email ILIKE ${p(like)} OR website_url ILIKE ${p(like)})`);
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const countRows = await rawSql(`SELECT COUNT(*) AS c FROM leads ${where}`, params);
  const total = parseInt(String(countRows[0].c));

  const leads = await rawSql(
    `SELECT * FROM leads ${where} ORDER BY created_at DESC LIMIT ${p(limit)} OFFSET ${p(offset)}`,
    params
  );

  return NextResponse.json({ leads, total, page, pages: Math.ceil(total / limit) });
}
