import { NextResponse } from "next/server";
import { getMobileUser } from "@/app/lib/auth/mobile";
import { db } from "@/app/lib/db";
import { teams, users } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { signToken } from "@/app/lib/auth/jwt";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.teamId) return NextResponse.json({ error: "Already in a team" }, { status: 400 });

  const { id } = await params;
  const [team] = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  await db.update(users).set({ teamId: id }).where(eq(users.id, user.userId));

  const newToken = await signToken({ userId: user.userId, email: user.email, teamId: id });
  return NextResponse.json({ success: true, token: newToken, teamId: id });
}
