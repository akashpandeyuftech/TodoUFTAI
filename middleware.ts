import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = "uftech-token";

const publicPaths = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    if (token) {
      try {
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {
        // invalid token, let them stay on auth page
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const teamId = payload.teamId as string | null;

    if (!teamId && !pathname.startsWith("/join-team")) {
      return NextResponse.redirect(new URL("/join-team", request.url));
    }

    if (teamId && pathname.startsWith("/join-team")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-todos/:path*",
    "/team-todos/:path*",
    "/members/:path*",
    "/history/:path*",
    "/export/:path*",
    "/join-team/:path*",
    "/login",
    "/register",
  ],
};
