import { NextResponse } from "next/server";
import { getMobileUser } from "@/app/lib/auth/mobile";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [u] = await db
    .select({ id: users.id, email: users.email, displayName: users.displayName, teamId: users.teamId })
    .from(users)
    .where(eq(users.id, user.userId))
    .limit(1);

  if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(u);
}
