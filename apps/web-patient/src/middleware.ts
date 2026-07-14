import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) {
  throw new Error("JWT_SECRET environment variable is required");
}
const JWT_SECRET = new TextEncoder().encode(rawSecret);

const PUBLIC_ROUTES = ["/login", "/registro"];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("jwt_token")?.value;
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Role-based access control: web-patient only allows PATIENT
    const role = payload.role as string | undefined;
    if (role && role !== "PATIENT") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "wrong_app");
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("jwt_token");
      return response;
    }
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("jwt_token");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|.*\\.ico|sw.js|manifest.webmanifest|.*\\.webmanifest).*)",
  ],
};
