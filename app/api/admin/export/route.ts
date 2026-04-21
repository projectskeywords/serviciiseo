import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { generateXLSX, generateCSV } from '@/lib/export';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value || '';
  if (!validateSession(token)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const format = new URL(req.url).searchParams.get('format') || 'xlsx';
  const date = new Date().toISOString().split('T')[0];

  if (format === 'csv') {
    const csv = generateCSV();
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="keywords-leads-${date}.csv"`,
      },
    });
  }

  const buffer = generateXLSX();
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="keywords-leads-${date}.xlsx"`,
    },
  });
}
