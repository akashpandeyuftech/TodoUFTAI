import { NextResponse } from "next/server";
import { getMobileUser } from "@/app/lib/auth/mobile";
import { db } from "@/app/lib/db";
import { todos, users } from "@/app/lib/db/schema";
import { eq, and, desc, asc, or, sql, aliasedTable } from "drizzle-orm";
import { todoSchema } from "@/app/lib/validators";
import { recordHistory } from "@/app/lib/actions/history";

function todoSnapshot(todo: Record<string, unknown>) {
  return {
    title: todo.title,
    description: todo.description,
    isCompleted: todo.isCompleted,
    dueDate: todo.dueDate,
    priority: todo.priority,
    ownerType: todo.ownerType,
    ownerId: todo.ownerId,
    claimedByUserId: todo.claimedByUserId ?? null,
  };
}

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user || !user.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;

  const mine = and(eq(todos.ownerType, "member"), eq(todos.ownerId, user.userId));
  const claimedFromTeam = and(
    eq(todos.ownerType, "team"),
    eq(todos.ownerId, user.teamId),
    eq(todos.claimedByUserId, user.userId)
  );
  let whereClause = or(mine, claimedFromTeam);

  if (filter === "active") whereClause = and(whereClause, eq(todos.isCompleted, false));
  else if (filter === "completed") whereClause = and(whereClause, eq(todos.isCompleted, true));

  let orderBy;
  if (sort === "due_date") orderBy = asc(todos.dueDate);
  else if (sort === "priority") orderBy = sql`CASE ${todos.priority} WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`;
  else orderBy = desc(todos.createdAt);

  const claimantUsers = aliasedTable(users, "claimant_my");
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

export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user || !user.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = todoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { title, description, due_date, priority, owner_type } = parsed.data;
  const ownerId = owner_type === "member" ? user.userId : user.teamId;

  const [todo] = await db
    .insert(todos)
    .values({ title, description, dueDate: due_date ? new Date(due_date) : null, priority, ownerType: owner_type, ownerId, createdBy: user.userId })
    .returning();

  await recordHistory(todo.id, user.userId, "created", null, todoSnapshot(todo as unknown as Record<string, unknown>));
  return NextResponse.json(todo, { status: 201 });
}
