import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // ── Owner-only routes ────────────────────────────────────────────────────────
  if (pathname.startsWith("/owner")) {
    const session = req.auth;

    // Not logged in → redirect to login
    if (!session?.user) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Logged in as customer → back to home
    if (session.user.role === "customer") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/owner/:path*"],
};
