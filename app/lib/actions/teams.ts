"use server";

import { db } from "../db";
import { teams, users } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { joinTeamSchema, createTeamSchema } from "../validators";
import { getCurrentUser, setAuthCookie } from "../auth/jwt";
import { emailCanCreateTeams } from "../config/team-creators";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function getTeams() {
  const result = await db
    .select({
      id: teams.id,
      name: teams.name,
      description: teams.description,
      createdAt: teams.createdAt,
      memberCount: sql<number>`count(${users.id})`.as("member_count"),
    })
    .from(teams)
    .leftJoin(users, eq(users.teamId, teams.id))
    .groupBy(teams.id);

  return result;
}

export async function joinTeam(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = joinTeamSchema.safeParse({
    team_id: formData.get("team_id"),
  });
  if (!parsed.success) {
    return { error: "Invalid team selection" };
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.userId))
    .limit(1);

  if (dbUser?.teamId) {
    return { error: "You have already joined a team" };
  }

  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, parsed.data.team_id))
    .limit(1);

  if (!team) {
    return { error: "Team not found" };
  }

  await db
    .update(users)
    .set({ teamId: parsed.data.team_id })
    .where(eq(users.id, user.userId));

  await setAuthCookie({
    userId: user.userId,
    email: user.email,
    teamId: parsed.data.team_id,
  });

  revalidatePath("/");
  redirect("/dashboard");
}

export async function createTeam(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!emailCanCreateTeams(user.email)) {
    return { error: "Creating teams is not enabled for your account." };
  }

  const parsed = createTeamSchema.safeParse({
    name: (formData.get("name") as string)?.trim(),
    description: (formData.get("description") as string)?.trim() || null,
  });
  if (!parsed.success) {
    return {
      error: "Invalid details",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const [dbUser] = await db.select().from(users).where(eq(users.id, user.userId)).limit(1);
  if (!dbUser) redirect("/login");
  if (dbUser.teamId) {
    return { error: "You already belong to a team." };
  }

  const [nameTaken] = await db.select({ id: teams.id }).from(teams).where(eq(teams.name, parsed.data.name)).limit(1);
  if (nameTaken) {
    return { error: "That team name is already taken. Pick another." };
  }

  const [createdTeam] = await db
    .insert(teams)
    .values({
      name: parsed.data.name,
      description: parsed.data.description,
    })
    .returning();

  await db.update(users).set({ teamId: createdTeam!.id }).where(eq(users.id, user.userId));

  await setAuthCookie({
    userId: user.userId,
    email: user.email,
    teamId: createdTeam!.id,
  });

  revalidatePath("/join-team");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function getTeamMembers(teamId: string) {
  return db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.teamId, teamId));
}
