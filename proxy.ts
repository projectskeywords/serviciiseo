import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin routes (but not login page or API login)
  if (pathname.startsWith('/admin') && pathname !== '/admin' && !pathname.startsWith('/api/admin/login')) {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  // Redirect root to /ro
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/ro', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*'],
};
