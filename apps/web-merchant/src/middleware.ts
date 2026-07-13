import { createAuthMiddleware } from "@saludtech/shared/src/middleware";

export const middleware = createAuthMiddleware(["/login"]);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|.*\\.ico).*)",
  ],
};
