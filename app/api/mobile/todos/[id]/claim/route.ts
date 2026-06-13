import { NextResponse } from "next/server";
import { getMobileUser } from "@/app/lib/auth/mobile";
import { db } from "@/app/lib/db";
import { todos } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { recordHistory } from "@/app/lib/actions/history";

function todoSnapshot(todo: Record<string, unknown>) {
  return {
    title: todo.title, description: todo.description, isCompleted: todo.isCompleted,
    dueDate: todo.dueDate, priority: todo.priority, ownerType: todo.ownerType,
    ownerId: todo.ownerId, claimedByUserId: todo.claimedByUserId ?? null,
  };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user || !user.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [existing] = await db.select().from(todos).where(eq(todos.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.ownerType !== "team" || existing.ownerId !== user.teamId)
    return NextResponse.json({ error: "Invalid task for your team" }, { status: 400 });
  if (existing.claimedByUserId && existing.claimedByUserId !== user.userId)
    return NextResponse.json({ error: "Someone else already picked this task" }, { status: 409 });
  if (existing.claimedByUserId === user.userId)
    return NextResponse.json({ success: true });

  const prevSnapshot = todoSnapshot(existing as unknown as Record<string, unknown>);
  const [updated] = await db.update(todos).set({ claimedByUserId: user.userId, updatedAt: new Date() }).where(eq(todos.id, id)).returning();
  await recordHistory(id, user.userId, "claimed", prevSnapshot, todoSnapshot(updated as unknown as Record<string, unknown>));
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user || !user.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [existing] = await db.select().from(todos).where(eq(todos.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.ownerType !== "team" || existing.ownerId !== user.teamId)
    return NextResponse.json({ error: "Invalid task" }, { status: 400 });
  if (existing.claimedByUserId !== user.userId)
    return NextResponse.json({ error: "Only whoever took this task can put it back" }, { status: 403 });

  const prevSnapshot = todoSnapshot(existing as unknown as Record<string, unknown>);
  const [updated] = await db.update(todos).set({ claimedByUserId: null, updatedAt: new Date() }).where(eq(todos.id, id)).returning();
  await recordHistory(id, user.userId, "released", prevSnapshot, todoSnapshot(updated as unknown as Record<string, unknown>));
  return NextResponse.json({ success: true });
}
