import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes — no login required
const publicPaths = ["/", "/login"];

// Paths to skip entirely (auth API, static assets)
const ignorePrefixes = ["/api/auth", "/_next", "/favicon.ico"];

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8")
    );
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and auth API routes
  if (ignorePrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow public pages
  if (publicPaths.includes(pathname)) {
    // If logged in user visits /login, redirect them to dashboard
    const token =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (token && pathname === "/login") {
      const payload = decodeJwtPayload(token);
      const role = payload?.role;
      if (role === "student") {
        return NextResponse.redirect(new URL("/dashboard/student", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // --- Protected routes below ---

  const token =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  // No token → redirect to login with callback
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode role from JWT for route guarding
  const payload = decodeJwtPayload(token);
  const role = payload?.role;

  // Student tries to access admin dashboard routes
  if (role === "student") {
    // Allow student-specific routes and shared routes
    const studentAllowed = [
      "/dashboard/student",
      "/dashboard/notifications",
      "/api/student",
      "/api/events",
      "/api/library",
      "/api/notifications",
    ];
    const isAllowed = studentAllowed.some((p) => pathname.startsWith(p));

    if (pathname.startsWith("/dashboard") && !isAllowed) {
      return NextResponse.redirect(
        new URL("/dashboard/student", request.url)
      );
    }
  }

  // Non-student tries to access student portal routes
  if (role && role !== "student" && pathname.startsWith("/dashboard/student")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
