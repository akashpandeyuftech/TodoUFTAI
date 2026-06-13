import { NextResponse } from "next/server";
import { getMobileUser } from "@/app/lib/auth/mobile";
import { db } from "@/app/lib/db";
import { teams, users } from "@/app/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { createTeamSchema } from "@/app/lib/validators";
import { emailCanCreateTeams } from "@/app/lib/config/team-creators";

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db
    .select({
      id: teams.id, name: teams.name, description: teams.description, createdAt: teams.createdAt,
      memberCount: sql<number>`count(${users.id})`.as("member_count"),
    })
    .from(teams)
    .leftJoin(users, eq(users.teamId, teams.id))
    .groupBy(teams.id);

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!emailCanCreateTeams(user.email)) return NextResponse.json({ error: "Not allowed to create teams" }, { status: 403 });

  const body = await request.json();
  const parsed = createTeamSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });

  const [nameTaken] = await db.select({ id: teams.id }).from(teams).where(eq(teams.name, parsed.data.name)).limit(1);
  if (nameTaken) return NextResponse.json({ error: "Team name already taken" }, { status: 409 });

  const [team] = await db.insert(teams).values({ name: parsed.data.name, description: parsed.data.description }).returning();
  return NextResponse.json(team, { status: 201 });
}
