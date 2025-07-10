// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Public routes that don't require authentication
const publicPaths = ["/", "/login", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  // Get token from cookie
  const token = request.cookies.get("token")?.value;

  // Not authenticated: redirect to login
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  try {
    // Verify token using the same secret as the backend
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "Secret_key!809"
    );
    const { payload } = await jwtVerify(token, secret);

    // Role-based protection
    const userRole = payload.role as string;

    // If trying to access login page while authenticated, redirect to dashboard
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Admin routes
    if (pathname.startsWith("/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // HR routes
    if (pathname.startsWith("/hr") && userRole !== "hr") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Staff routes
    if (pathname.startsWith("/staff") && userRole !== "staff") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Fleet Manager routes
    if (pathname.startsWith("/fleet") && userRole !== "fleetmanager") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // All good
    return NextResponse.next();
  } catch (error) {
    console.error("Token verification error:", error);
    // Invalid token: redirect to login
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }
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
