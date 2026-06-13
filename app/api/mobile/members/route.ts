import { NextResponse } from "next/server";
import { getMobileUser } from "@/app/lib/auth/mobile";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user || !user.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const members = await db
    .select({ id: users.id, email: users.email, displayName: users.displayName, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.teamId, user.teamId));

  return NextResponse.json(members);
}
