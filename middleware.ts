// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicPaths = ["/", "/login", "/api/auth", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // For now, let all authenticated routes pass through
  // The frontend will handle authentication checks using localStorage
  // This can be enhanced later with proper session management
  
  // Let the frontend handle login page redirects
  // The frontend will check if user is authenticated and redirect accordingly

  // For dashboard routes, let the frontend handle permission checks
  // The frontend will use the user's position access permissions to show/hide navigation
  if (pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // All good for other authenticated routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};