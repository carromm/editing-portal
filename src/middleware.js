import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow the login page and API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Check if the user is authenticated
  const isAuthenticated = request.cookies.get("auth-token");

  if (!isAuthenticated && !pathname.startsWith("/login")) {
    // Redirect to the login page if the user is not authenticated
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && (pathname === "/login" || pathname === "/")) {
    return NextResponse.redirect(new URL("/enterprise-id", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
