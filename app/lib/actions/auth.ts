"use server";

import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { registerSchema, loginSchema } from "../validators";
import { setAuthCookie, clearAuthCookie } from "../auth/jwt";
import { redirect } from "next/navigation";

export type AuthResult = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function register(formData: FormData): Promise<AuthResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    display_name: formData.get("display_name") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { email, password, display_name } = parsed.data;

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return { error: "Email already registered" };
  }

  const passwordHash = await hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, displayName: display_name })
    .returning();

  await setAuthCookie({
    userId: user.id,
    email: user.email,
    teamId: null,
  });

  redirect("/join-team");
}

export async function login(formData: FormData): Promise<AuthResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return { error: "Invalid email or password" };
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  await setAuthCookie({
    userId: user.id,
    email: user.email,
    teamId: user.teamId,
  });

  if (!user.teamId) {
    redirect("/join-team");
  }
  redirect("/dashboard");
}

export async function logout() {
  await clearAuthCookie();
  redirect("/login");
}
