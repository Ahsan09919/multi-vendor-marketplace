import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const user = req.auth?.user;
  const isLoggedIn = !!user;
  const path = nextUrl.pathname;

  const loginUrl = new URL("/login", nextUrl);
  loginUrl.searchParams.set("callbackUrl", path);

  if (path.startsWith("/admin")) {
    if (!isLoggedIn) return NextResponse.redirect(loginUrl);
    if (user.role !== "ADMIN") return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (path.startsWith("/vendor")) {
    if (!isLoggedIn) return NextResponse.redirect(loginUrl);
    if (user.role !== "VENDOR" && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (path.startsWith("/account")) {
    if (!isLoggedIn) return NextResponse.redirect(loginUrl);
  }

  if ((path === "/login" || path === "/register") && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*", "/account/:path*", "/login", "/register"],
};
