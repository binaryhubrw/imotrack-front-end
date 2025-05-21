// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ✅ Mocked getToken for testing without APIs
async function getToken({ req }: { req: NextRequest }) {
  const pathname = req.nextUrl.pathname;

  // Simulate no token if accessing login
  if (pathname === '/login') return null;

  // Simulate a user being logged in when navigating to any other page
  return {
    role: pathname.startsWith('/admin') ? 'USER' : 'ADMIN', // Change to 'ADMIN' to allow /admin
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Public paths
  const publicPaths = ['/', '/login', '/api/auth'];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  // 🔐 Redirect to login if no token
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // 🚫 Prevent non-admins from accessing /admin
  if (pathname.startsWith('/admin') && token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
