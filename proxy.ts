import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token");

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/admin");

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(
      new URL("/auth/login", request.url),
    );
  }

  return NextResponse.next();
}