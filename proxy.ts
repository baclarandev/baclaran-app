import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/settings",
  "/volunteers",
  "/events",
  "/schedule",
  "/ministries",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if the path starts with a protected route
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Read auth cookie
  const token = req.cookies.get("access_token")?.value;

  // Not authenticated → redirect to login
  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/volunteers/:path*",
    "/events/:path*",
    "/schedule/:path*",
    "/ministries/:path*",
  ],
};
