import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { registerSchema } from "@/app/lib/validators";
import { signToken } from "@/app/lib/auth/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, password, display_name } = parsed.data;

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, displayName: display_name })
    .returning();

  const token = await signToken({
    userId: user.id,
    email: user.email,
    teamId: null,
  });

  const cookieStore = await cookies();
  cookieStore.set("uftech-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({ success: true, token });
}
