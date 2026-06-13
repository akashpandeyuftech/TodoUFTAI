import { NextResponse } from "next/server";
import { getMobileUser } from "@/app/lib/auth/mobile";
import { db } from "@/app/lib/db";
import { todos, users } from "@/app/lib/db/schema";
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

  if (existing.ownerType === "team" && existing.ownerId !== user.teamId)
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  if (existing.ownerType === "member") {
    const [owner] = await db.select().from(users).where(eq(users.id, existing.ownerId)).limit(1);
    if (!owner || owner.teamId !== user.teamId)
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const prevSnapshot = todoSnapshot(existing as unknown as Record<string, unknown>);
  const newCompleted = !existing.isCompleted;
  const [updated] = await db
    .update(todos)
    .set({ isCompleted: newCompleted, updatedAt: new Date() })
    .where(eq(todos.id, id))
    .returning();

  await recordHistory(id, user.userId, newCompleted ? "completed" : "uncompleted", prevSnapshot, todoSnapshot(updated as unknown as Record<string, unknown>));
  return NextResponse.json({ success: true, isCompleted: newCompleted });
}
