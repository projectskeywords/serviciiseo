import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { sql, ensureTables } from '@/lib/db';

export async function GET(req: NextRequest) {
  await ensureTables();

  const token = req.cookies.get('admin_token')?.value || '';
  if (!(await validateSession(token))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];

  const [totalRow]    = await sql`SELECT COUNT(*)            AS c   FROM leads`;
  const [todayRow]    = await sql`SELECT COUNT(*)            AS c   FROM leads WHERE DATE(created_at) = ${today}`;
  const [avgRow]      = await sql`SELECT AVG(score_overall)  AS avg FROM leads WHERE status = 'completed'`;
  const [completedRow]= await sql`SELECT COUNT(*)            AS c   FROM leads WHERE status = 'completed'`;

  const total     = parseInt(String((totalRow     as { c: string }).c));
  const todayCount= parseInt(String((todayRow     as { c: string }).c));
  const completed = parseInt(String((completedRow as { c: string }).c));
  const avgScore  = parseFloat(String((avgRow     as { avg: string | null }).avg ?? '0'));

  return NextResponse.json({
    total,
    today: todayCount,
    avgScore: Math.round(avgScore),
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  });
}
