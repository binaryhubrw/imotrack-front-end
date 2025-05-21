// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mock getToken: reads a fake "token" from cookies for demonstration
function getToken(req: NextRequest) {
  // For real apps, use cookies or headers. For mock/dev, use a query param or a fake cookie.
  const cookie = req.cookies.get('role')?.value;
  if (!cookie) return null;
  // Example: cookie value = "admin", "fleet-manager", "staff", "driver"
  return { role: cookie };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  const publicPaths = ['/', '/login', '/api/auth'];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const token = getToken(request);

  // Not authenticated: redirect to login
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Role-based protection
  // Example: Only allow admin to access /admin, fleet-manager to /fleet, etc.
  if (pathname.startsWith('/admin') && token.role !== 'super-admin' && token.role !== 'super-admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (pathname.startsWith('/fleet') && token.role !== 'fleet-manager') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (pathname.startsWith('/staff') && token.role !== 'staff' && token.role !== 'staff-admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (pathname.startsWith('/driver') && token.role !== 'driver') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // All good
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
