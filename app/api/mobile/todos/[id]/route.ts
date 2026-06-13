import { NextResponse } from "next/server";
import { getMobileUser } from "@/app/lib/auth/mobile";
import { db } from "@/app/lib/db";
import { todos, users } from "@/app/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { updateTodoSchema } from "@/app/lib/validators";
import { recordHistory } from "@/app/lib/actions/history";

function todoSnapshot(todo: Record<string, unknown>) {
  return {
    title: todo.title, description: todo.description, isCompleted: todo.isCompleted,
    dueDate: todo.dueDate, priority: todo.priority, ownerType: todo.ownerType,
    ownerId: todo.ownerId, claimedByUserId: todo.claimedByUserId ?? null,
  };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user || !user.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [existing] = await db.select().from(todos).where(eq(todos.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isTeamTodo = existing.ownerType === "team" && existing.ownerId === user.teamId;
  const isMemberTodo = existing.ownerType === "member";
  if (isMemberTodo) {
    const [owner] = await db.select().from(users).where(eq(users.id, existing.ownerId)).limit(1);
    if (!owner || owner.teamId !== user.teamId) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  if (!isTeamTodo && !isMemberTodo) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const body = await request.json();
  const parsed = updateTodoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.due_date !== undefined) updates.dueDate = parsed.data.due_date ? new Date(parsed.data.due_date) : null;
  if (parsed.data.priority !== undefined) updates.priority = parsed.data.priority;

  const prevSnapshot = todoSnapshot(existing as unknown as Record<string, unknown>);
  const [updated] = await db.update(todos).set(updates).where(eq(todos.id, id)).returning();
  await recordHistory(id, user.userId, "updated", prevSnapshot, todoSnapshot(updated as unknown as Record<string, unknown>));

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user || !user.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [existing] = await db.select().from(todos).where(eq(todos.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (existing.ownerType === "team" && existing.ownerId !== user.teamId)
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  if (existing.ownerType === "member" && existing.ownerId !== user.userId)
    return NextResponse.json({ error: "Only the owner can delete personal todos" }, { status: 403 });

  const prevSnapshot = todoSnapshot(existing as unknown as Record<string, unknown>);
  await recordHistory(id, user.userId, "deleted", prevSnapshot, null);
  await db.delete(todos).where(eq(todos.id, id));

  return NextResponse.json({ success: true });
}
