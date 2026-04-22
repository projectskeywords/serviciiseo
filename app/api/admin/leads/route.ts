import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { sql, ensureTables } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await ensureTables();
  } catch { /* non-fatal */ }

  const token = req.cookies.get('admin_token')?.value || '';
  if (!(await validateSession(token))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get('page')   || '1'));
  const limit  = 20;
  const offset = (page - 1) * limit;
  const from   = searchParams.get('from')   || null;
  const to     = searchParams.get('to')     || null;
  const lang   = searchParams.get('lang')   || null;
  const status = searchParams.get('status') || null;
  const search = searchParams.get('search') || null;
  const like   = search ? `%${search}%` : null;

  try {
    // Use fixed-param query — no dynamic SQL building, fully compatible with Neon tagged templates
    const countRows = await sql`
      SELECT COUNT(*) AS c FROM leads
      WHERE (${from}::date  IS NULL OR DATE(created_at) >= ${from}::date)
        AND (${to}::date    IS NULL OR DATE(created_at) <= ${to}::date)
        AND (${lang}        IS NULL OR language = ${lang})
        AND (${status}      IS NULL OR status   = ${status})
        AND (${like}        IS NULL OR email ILIKE ${like} OR website_url ILIKE ${like})
    `;

    const total = parseInt(String((countRows[0] as { c: string }).c));

    const leads = await sql`
      SELECT * FROM leads
      WHERE (${from}::date  IS NULL OR DATE(created_at) >= ${from}::date)
        AND (${to}::date    IS NULL OR DATE(created_at) <= ${to}::date)
        AND (${lang}        IS NULL OR language = ${lang})
        AND (${status}      IS NULL OR status   = ${status})
        AND (${like}        IS NULL OR email ILIKE ${like} OR website_url ILIKE ${like})
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return NextResponse.json({ leads, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[Admin/Leads] query error:', err);
    return NextResponse.json({ error: 'db_error', message: String(err) }, { status: 500 });
  }
}
