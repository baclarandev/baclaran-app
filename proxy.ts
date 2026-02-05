import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

const PUBLIC_PATHS = ["/auth/login"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get("access_token")?.value;

  // ✅ If user is logged in and tries to visit /auth/login → kick to dashboard
  if (PUBLIC_PATHS.includes(pathname)) {
    if (accessToken) {
      try {
        jwt.verify(accessToken, JWT_SECRET);
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } catch {
        // token invalid → allow login
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // 🔒 Any other route is protected
  if (!accessToken) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    jwt.verify(accessToken, JWT_SECRET);
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
    "/auth/login",
  ],
};
