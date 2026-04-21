import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value || '';
  if (!validateSession(token)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = 20;
  const offset = (page - 1) * limit;
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const lang = searchParams.get('lang') || '';
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  let where = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (from) { where += ' AND date(created_at) >= ?'; params.push(from); }
  if (to) { where += ' AND date(created_at) <= ?'; params.push(to); }
  if (lang) { where += ' AND language = ?'; params.push(lang); }
  if (status) { where += ' AND status = ?'; params.push(status); }
  if (search) { where += ' AND (email LIKE ? OR website_url LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const total = (db.prepare(`SELECT COUNT(*) as c FROM leads ${where}`).get(...params) as { c: number }).c;
  const leads = db.prepare(`SELECT * FROM leads ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);

  return NextResponse.json({ leads, total, page, pages: Math.ceil(total / limit) });
}
