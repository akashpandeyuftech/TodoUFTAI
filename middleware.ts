import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret(): Uint8Array | null {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) return null;
  return new TextEncoder().encode(s);
}

const COOKIE_NAME = "uftech-token";
const publicPaths = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = getJwtSecret();
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!secret && !isPublic) {
    return NextResponse.json(
      { error: "Server misconfiguration: JWT_SECRET missing or too short (min 32 characters)." },
      { status: 503 }
    );
  }

  if (!secret && isPublic) {
    return NextResponse.next();
  }

  if (isPublic) {
    if (token) {
      try {
        await jwtVerify(token, secret!);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {
        // invalid token — allow auth pages
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret!);
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
