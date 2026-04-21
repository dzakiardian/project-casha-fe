// middleware.ts (root project, sejajar dengan app/)
import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/profile', '/checkout', '/orders'];
const authRoutes = ['/login', '/register'];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some(r => pathname.startsWith(r));
  const isAuthPage = authRoutes.some(r => pathname.startsWith(r));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};