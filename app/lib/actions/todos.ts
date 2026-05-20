"use server";

import { db } from "../db";
import { todos, users } from "../db/schema";
import { eq, and, desc, asc, or, sql, aliasedTable } from "drizzle-orm";
import { todoSchema, updateTodoSchema } from "../validators";
import { getCurrentUser } from "../auth/jwt";
import { recordHistory } from "./history";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

export async function createTodo(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !user.teamId) redirect("/login");

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    due_date: (formData.get("due_date") as string) || null,
    priority: formData.get("priority") as string,
    owner_type: formData.get("owner_type") as string,
  };

  const parsed = todoSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { title, description, due_date, priority, owner_type } = parsed.data;
  const ownerId = owner_type === "member" ? user.userId : user.teamId;

  const [todo] = await db
    .insert(todos)
    .values({
      title,
      description,
      dueDate: due_date ? new Date(due_date) : null,
      priority,
      ownerType: owner_type,
      ownerId,
      createdBy: user.userId,
    })
    .returning();

  await recordHistory(todo.id, user.userId, "created", null, todoSnapshot(todo as unknown as Record<string, unknown>));

  revalidatePath("/my-todos");
  revalidatePath("/team-todos");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function claimTeamTodo(todoId: string) {
  const user = await getCurrentUser();
  if (!user || !user.teamId) redirect("/login");

  const [existing] = await db.select().from(todos).where(eq(todos.id, todoId)).limit(1);
  if (!existing) return { error: "Todo not found" };

  if (existing.ownerType !== "team" || existing.ownerId !== user.teamId) {
    return { error: "Invalid task for your team" };
  }

  if (existing.claimedByUserId && existing.claimedByUserId !== user.userId) {
    return { error: "Someone else already picked this task" };
  }

  if (existing.claimedByUserId === user.userId) return { success: true };

  const prevSnapshot = todoSnapshot(existing as unknown as Record<string, unknown>);

  const [updated] = await db
    .update(todos)
    .set({ claimedByUserId: user.userId, updatedAt: new Date() })
    .where(eq(todos.id, todoId))
    .returning();

  await recordHistory(
    todoId,
    user.userId,
    "claimed",
    prevSnapshot,
    todoSnapshot(updated as unknown as Record<string, unknown>)
  );

  revalidatePath("/my-todos");
  revalidatePath("/team-todos");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function releaseTeamTodoClaim(todoId: string) {
  const user = await getCurrentUser();
  if (!user || !user.teamId) redirect("/login");

  const [existing] = await db.select().from(todos).where(eq(todos.id, todoId)).limit(1);
  if (!existing) return { error: "Todo not found" };

  if (existing.ownerType !== "team" || existing.ownerId !== user.teamId) {
    return { error: "Invalid task" };
  }

  if (existing.claimedByUserId !== user.userId) {
    return { error: "Only whoever took this task can put it back" };
  }

  const prevSnapshot = todoSnapshot(existing as unknown as Record<string, unknown>);

  const [updated] = await db
    .update(todos)
    .set({ claimedByUserId: null, updatedAt: new Date() })
    .where(eq(todos.id, todoId))
    .returning();

  await recordHistory(
    todoId,
    user.userId,
    "released",
    prevSnapshot,
    todoSnapshot(updated as unknown as Record<string, unknown>)
  );

  revalidatePath("/my-todos");
  revalidatePath("/team-todos");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTodo(todoId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !user.teamId) redirect("/login");

  const [existing] = await db.select().from(todos).where(eq(todos.id, todoId)).limit(1);
  if (!existing) return { error: "Todo not found" };

  const isTeamTodo = existing.ownerType === "team" && existing.ownerId === user.teamId;
  const isMemberTodo = existing.ownerType === "member";

  if (isMemberTodo) {
    const [owner] = await db.select().from(users).where(eq(users.id, existing.ownerId)).limit(1);
    if (!owner || owner.teamId !== user.teamId) {
      return { error: "Access denied" };
    }
  }
  if (!isTeamTodo && !isMemberTodo) return { error: "Access denied" };

  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    raw[key] = value;
  }

  const parsed = updateTodoSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.due_date !== undefined) updates.dueDate = parsed.data.due_date ? new Date(parsed.data.due_date) : null;
  if (parsed.data.priority !== undefined) updates.priority = parsed.data.priority;

  const prevSnapshot = todoSnapshot(existing as unknown as Record<string, unknown>);

  const [updated] = await db
    .update(todos)
    .set(updates)
    .where(eq(todos.id, todoId))
    .returning();

  await recordHistory(todoId, user.userId, "updated", prevSnapshot, todoSnapshot(updated as unknown as Record<string, unknown>));

  revalidatePath("/my-todos");
  revalidatePath("/team-todos");
  revalidatePath("/members");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleTodo(todoId: string) {
  const user = await getCurrentUser();
  if (!user || !user.teamId) redirect("/login");

  const [existing] = await db.select().from(todos).where(eq(todos.id, todoId)).limit(1);
  if (!existing) return { error: "Todo not found" };

  if (existing.ownerType === "team" && existing.ownerId !== user.teamId) {
    return { error: "Access denied" };
  }
  if (existing.ownerType === "member") {
    const [owner] = await db.select().from(users).where(eq(users.id, existing.ownerId)).limit(1);
    if (!owner || owner.teamId !== user.teamId) {
      return { error: "Access denied" };
    }
  }

  const prevSnapshot = todoSnapshot(existing as unknown as Record<string, unknown>);
  const newCompleted = !existing.isCompleted;

  const [updated] = await db
    .update(todos)
    .set({ isCompleted: newCompleted, updatedAt: new Date() })
    .where(eq(todos.id, todoId))
    .returning();

  await recordHistory(
    todoId,
    user.userId,
    newCompleted ? "completed" : "uncompleted",
    prevSnapshot,
    todoSnapshot(updated as unknown as Record<string, unknown>)
  );

  revalidatePath("/my-todos");
  revalidatePath("/team-todos");
  revalidatePath("/members");
  revalidatePath("/dashboard");
  return { success: true, isCompleted: newCompleted };
}

export async function deleteTodo(todoId: string) {
  const user = await getCurrentUser();
  if (!user || !user.teamId) redirect("/login");

  const [existing] = await db.select().from(todos).where(eq(todos.id, todoId)).limit(1);
  if (!existing) return { error: "Todo not found" };

  if (existing.ownerType === "team" && existing.ownerId !== user.teamId) {
    return { error: "Access denied" };
  }
  if (existing.ownerType === "member" && existing.ownerId !== user.userId) {
    return { error: "Only the owner can delete personal todos" };
  }

  const prevSnapshot = todoSnapshot(existing as unknown as Record<string, unknown>);

  await recordHistory(todoId, user.userId, "deleted", prevSnapshot, null);
  await db.delete(todos).where(eq(todos.id, todoId));

  revalidatePath("/my-todos");
  revalidatePath("/team-todos");
  revalidatePath("/members");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getMyTodos(userId: string, teamId: string, filter?: string, sort?: string) {
  const mine = and(eq(todos.ownerType, "member"), eq(todos.ownerId, userId));
  const claimedFromTeam = and(
    eq(todos.ownerType, "team"),
    eq(todos.ownerId, teamId),
    eq(todos.claimedByUserId, userId)
  );

  let whereClause = or(mine, claimedFromTeam);

  if (filter === "active") {
    whereClause = and(whereClause, eq(todos.isCompleted, false));
  } else if (filter === "completed") {
    whereClause = and(whereClause, eq(todos.isCompleted, true));
  }

  let orderBy;
  switch (sort) {
    case "due_date":
      orderBy = asc(todos.dueDate);
      break;
    case "priority":
      orderBy = sql`CASE ${todos.priority} WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`;
      break;
    default:
      orderBy = desc(todos.createdAt);
  }

  const claimantUsers = aliasedTable(users, "claimant_my");

  return db
    .select({
      id: todos.id,
      title: todos.title,
      description: todos.description,
      isCompleted: todos.isCompleted,
      dueDate: todos.dueDate,
      priority: todos.priority,
      ownerType: todos.ownerType,
      ownerId: todos.ownerId,
      createdBy: todos.createdBy,
      createdAt: todos.createdAt,
      updatedAt: todos.updatedAt,
      creatorName: users.displayName,
      claimedByUserId: todos.claimedByUserId,
      claimantDisplayName: claimantUsers.displayName,
    })
    .from(todos)
    .leftJoin(users, eq(todos.createdBy, users.id))
    .leftJoin(claimantUsers, eq(todos.claimedByUserId, claimantUsers.id))
    .where(whereClause)
    .orderBy(orderBy);
}

export async function getTeamTodos(teamId: string, filter?: string, sort?: string) {
  let whereClause = and(eq(todos.ownerType, "team"), eq(todos.ownerId, teamId));

  if (filter === "active") {
    whereClause = and(whereClause, eq(todos.isCompleted, false));
  } else if (filter === "completed") {
    whereClause = and(whereClause, eq(todos.isCompleted, true));
  }

  let orderBy;
  switch (sort) {
    case "due_date":
      orderBy = asc(todos.dueDate);
      break;
    case "priority":
      orderBy = sql`CASE ${todos.priority} WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`;
      break;
    default:
      orderBy = desc(todos.createdAt);
  }

  const claimantUsers = aliasedTable(users, "claimant_team");

  return db
    .select({
      id: todos.id,
      title: todos.title,
      description: todos.description,
      isCompleted: todos.isCompleted,
      dueDate: todos.dueDate,
      priority: todos.priority,
      ownerType: todos.ownerType,
      ownerId: todos.ownerId,
      createdBy: todos.createdBy,
      createdAt: todos.createdAt,
      updatedAt: todos.updatedAt,
      creatorName: users.displayName,
      claimedByUserId: todos.claimedByUserId,
      claimantDisplayName: claimantUsers.displayName,
    })
    .from(todos)
    .leftJoin(users, eq(todos.createdBy, users.id))
    .leftJoin(claimantUsers, eq(todos.claimedByUserId, claimantUsers.id))
    .where(whereClause)
    .orderBy(orderBy);
}

export async function getMemberTodos(memberId: string, teamId: string) {
  const [member] = await db.select().from(users).where(eq(users.id, memberId)).limit(1);
  if (!member || member.teamId !== teamId) return [];

  return db
    .select({
      id: todos.id,
      title: todos.title,
      description: todos.description,
      isCompleted: todos.isCompleted,
      dueDate: todos.dueDate,
      priority: todos.priority,
      ownerType: todos.ownerType,
      ownerId: todos.ownerId,
      createdBy: todos.createdBy,
      createdAt: todos.createdAt,
      updatedAt: todos.updatedAt,
      creatorName: users.displayName,
    })
    .from(todos)
    .leftJoin(users, eq(todos.createdBy, users.id))
    .where(and(eq(todos.ownerType, "member"), eq(todos.ownerId, memberId)))
    .orderBy(desc(todos.createdAt));
}

export async function getDashboardStats(userId: string, teamId: string) {
  const mineOrClaimed = or(
    and(eq(todos.ownerType, "member"), eq(todos.ownerId, userId)),
    and(
      eq(todos.ownerType, "team"),
      eq(todos.ownerId, teamId),
      eq(todos.claimedByUserId, userId)
    )
  );

  const myTodosResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(todos)
    .where(mineOrClaimed);

  const myCompletedResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(todos)
    .where(and(mineOrClaimed, eq(todos.isCompleted, true)));

  const teamTodosResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(todos)
    .where(and(eq(todos.ownerType, "team"), eq(todos.ownerId, teamId)));

  const teamCompletedResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(todos)
    .where(and(eq(todos.ownerType, "team"), eq(todos.ownerId, teamId), eq(todos.isCompleted, true)));

  const membersResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.teamId, teamId));

  return {
    myTodos: Number(myTodosResult[0]?.count ?? 0),
    myCompleted: Number(myCompletedResult[0]?.count ?? 0),
    teamTodos: Number(teamTodosResult[0]?.count ?? 0),
    teamCompleted: Number(teamCompletedResult[0]?.count ?? 0),
    memberCount: Number(membersResult[0]?.count ?? 0),
  };
}

export async function getExportData(params: {
  userId: string;
  teamId: string;
  includeMyTodos?: boolean;
  myTodosFilter?: string;
  includeTeamTodos?: boolean;
  includeMemberTodos?: boolean;
  memberIds?: string[];
}) {
  const result: {
    myTodos?: Awaited<ReturnType<typeof getMyTodos>>;
    teamTodos?: Awaited<ReturnType<typeof getTeamTodos>>;
    memberTodos?: { memberId: string; memberName: string; todos: Awaited<ReturnType<typeof getMemberTodos>> }[];
  } = {};

  if (params.includeMyTodos) {
    result.myTodos = await getMyTodos(
      params.userId,
      params.teamId,
      params.myTodosFilter === "both" ? undefined : params.myTodosFilter
    );
  }

  if (params.includeTeamTodos) {
    result.teamTodos = await getTeamTodos(params.teamId);
  }

  if (params.includeMemberTodos && params.memberIds?.length) {
    result.memberTodos = [];
    for (const memberId of params.memberIds) {
      const [member] = await db.select().from(users).where(eq(users.id, memberId)).limit(1);
      if (member && member.teamId === params.teamId) {
        const memberTodos = await getMemberTodos(memberId, params.teamId);
        result.memberTodos.push({
          memberId,
          memberName: member.displayName,
          todos: memberTodos,
        });
      }
    }
  }

  return result;
}
