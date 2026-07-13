import { createAuthMiddleware } from "@saludtech/shared/src/middleware";

export const middleware = createAuthMiddleware(["/login", "/registro"]);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|.*\\.ico|sw.js|manifest.webmanifest|.*\\.webmanifest).*)",
  ],
};
