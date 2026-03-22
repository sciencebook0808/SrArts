import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginPage = pathname.startsWith('/admin/login');

  if (isAdminRoute && !isLoginPage) {
    const session = request.cookies.get('admin_session');
    if (!session?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
