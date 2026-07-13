import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}
const JWT_SECRET = new TextEncoder().encode(rawSecret ?? "fallback-dev-only-change-me");

/**
 * Creates a Next.js middleware that protects routes with JWT cookie auth.
 * @param publicRoutes Array of pathnames that bypass auth (e.g. ["/login", "/registro"])
 */
export function createAuthMiddleware(publicRoutes: string[] = ["/login"]) {
  return async function middleware(request: NextRequest) {
    const token = request.cookies.get("jwt_token")?.value;
    const { pathname } = request.nextUrl;

    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const loginUrl = new URL("/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("jwt_token");
      return response;
    }
  };
}

/**
 * Default matcher that excludes static assets from middleware.
 */
export const defaultMatcher = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|.*\\.ico|sw.js|manifest.webmanifest|.*\\.webmanifest).*)",
  ],
};
