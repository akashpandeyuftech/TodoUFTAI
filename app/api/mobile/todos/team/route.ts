import { NextResponse } from "next/server";
import { getMobileUser } from "@/app/lib/auth/mobile";
import { db } from "@/app/lib/db";
import { todos, users } from "@/app/lib/db/schema";
import { eq, and, desc, asc, sql, aliasedTable } from "drizzle-orm";

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user || !user.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;

  let whereClause = and(eq(todos.ownerType, "team"), eq(todos.ownerId, user.teamId));
  if (filter === "active") whereClause = and(whereClause, eq(todos.isCompleted, false));
  else if (filter === "completed") whereClause = and(whereClause, eq(todos.isCompleted, true));

  let orderBy;
  if (sort === "due_date") orderBy = asc(todos.dueDate);
  else if (sort === "priority") orderBy = sql`CASE ${todos.priority} WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`;
  else orderBy = desc(todos.createdAt);

  const claimantUsers = aliasedTable(users, "claimant_team");
  const data = await db
    .select({
      id: todos.id, title: todos.title, description: todos.description,
      isCompleted: todos.isCompleted, dueDate: todos.dueDate, priority: todos.priority,
      ownerType: todos.ownerType, ownerId: todos.ownerId, createdBy: todos.createdBy,
      createdAt: todos.createdAt, updatedAt: todos.updatedAt, creatorName: users.displayName,
      claimedByUserId: todos.claimedByUserId, claimantDisplayName: claimantUsers.displayName,
    })
    .from(todos)
    .leftJoin(users, eq(todos.createdBy, users.id))
    .leftJoin(claimantUsers, eq(todos.claimedByUserId, claimantUsers.id))
    .where(whereClause)
    .orderBy(orderBy);

  return NextResponse.json(data);
}
