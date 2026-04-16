import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get("access_token")?.value;

  const PUBLIC_PATHS = [
    "/auth/login",
    "/auth/forgot-password",
    "/auth/reset-password",
  ];

  const ADMIN_ONLY_ROUTES = ["/settings"];

  // PUBLIC ROUTES
  if (PUBLIC_PATHS.includes(pathname)) {
    if (accessToken) {
      try {
        jwt.verify(accessToken, JWT_SECRET);
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } catch {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // NO TOKEN → LOGIN
  if (!accessToken) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET) as any;
    const role = decoded?.role;

    // 🔥 PUT IT HERE (RIGHT AFTER VERIFY)
    if (
      ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r)) &&
      role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/volunteers/:path*",
    "/events/:path*",
    "/schedule/:path*",
    "/ministries/:path*",
    "/auth/:path*",
  ],
};
