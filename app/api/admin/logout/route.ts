import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (token) deleteSession(token);

  const res = NextResponse.json({ success: true });
  res.cookies.set('admin_token', '', { maxAge: 0, path: '/' });
  return res;
}
