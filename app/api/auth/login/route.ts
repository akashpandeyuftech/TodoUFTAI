import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { loginSchema } from "@/app/lib/validators";
import { signToken } from "@/app/lib/auth/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await signToken({
    userId: user.id,
    email: user.email,
    teamId: user.teamId,
  });

  const cookieStore = await cookies();
  cookieStore.set("uftech-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({ success: true, teamId: user.teamId });
}
