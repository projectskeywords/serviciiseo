import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value || '';
  if (!validateSession(token)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const total = (db.prepare(`SELECT COUNT(*) as c FROM leads`).get() as { c: number }).c;
  const today = new Date().toISOString().split('T')[0];
  const todayCount = (db.prepare(`SELECT COUNT(*) as c FROM leads WHERE date(created_at) = ?`).get(today) as { c: number }).c;
  const avgScore = (db.prepare(`SELECT AVG(score_overall) as avg FROM leads WHERE status = 'completed'`).get() as { avg: number | null }).avg;
  const completed = (db.prepare(`SELECT COUNT(*) as c FROM leads WHERE status = 'completed'`).get() as { c: number }).c;

  return NextResponse.json({
    total,
    today: todayCount,
    avgScore: Math.round(avgScore ?? 0),
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  });
}
