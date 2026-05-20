"use server";

import { db } from "../db";
import { todoHistory, todos, users } from "../db/schema";
import { eq, desc, and, or, sql } from "drizzle-orm";

type HistoryAction = "created" | "updated" | "completed" | "uncompleted" | "deleted";

export async function recordHistory(
  todoId: string,
  userId: string,
  action: HistoryAction,
  previousState: Record<string, unknown> | null,
  newState: Record<string, unknown> | null
) {
  await db.insert(todoHistory).values({
    todoId,
    changedBy: userId,
    action,
    previousState,
    newState,
  });
}

export async function getHistory(filters: {
  userId: string;
  teamId: string;
  mode: "mine" | "team" | "member";
  memberId?: string;
  page?: number;
  limit?: number;
}) {
  const { userId, teamId, mode, memberId, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  let whereClause;

  if (mode === "mine") {
    const userTodoIds = db
      .select({ id: todos.id })
      .from(todos)
      .where(and(eq(todos.ownerType, "member"), eq(todos.ownerId, userId)));
    whereClause = or(
      sql`${todoHistory.todoId} IN (${userTodoIds})`,
      eq(todoHistory.changedBy, userId)
    );
  } else if (mode === "team") {
    const teamTodoIds = db
      .select({ id: todos.id })
      .from(todos)
      .where(and(eq(todos.ownerType, "team"), eq(todos.ownerId, teamId)));
    whereClause = sql`${todoHistory.todoId} IN (${teamTodoIds})`;
  } else if (mode === "member" && memberId) {
    const memberTodoIds = db
      .select({ id: todos.id })
      .from(todos)
      .where(and(eq(todos.ownerType, "member"), eq(todos.ownerId, memberId)));
    whereClause = sql`${todoHistory.todoId} IN (${memberTodoIds})`;
  }

  const entries = await db
    .select({
      id: todoHistory.id,
      todoId: todoHistory.todoId,
      action: todoHistory.action,
      previousState: todoHistory.previousState,
      newState: todoHistory.newState,
      changedAt: todoHistory.changedAt,
      changedByName: users.displayName,
      changedById: todoHistory.changedBy,
      todoTitle: todos.title,
    })
    .from(todoHistory)
    .leftJoin(users, eq(todoHistory.changedBy, users.id))
    .leftJoin(todos, eq(todoHistory.todoId, todos.id))
    .where(whereClause)
    .orderBy(desc(todoHistory.changedAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(todoHistory)
    .where(whereClause);

  const total = Number(countResult[0]?.count ?? 0);

  return { entries, total, page, totalPages: Math.ceil(total / limit) };
}
