"use client";

import { useRouter } from "next/navigation";
import { TodoCard } from "@/app/components/todos/todo-card";

interface Member {
  id: string;
  email: string;
  displayName: string;
}

interface Todo {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | Date | null;
  priority: "low" | "medium" | "high";
  ownerType: "member" | "team";
  creatorName: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface MembersClientProps {
  members: Member[];
  selectedMemberId: string | null;
  selectedMemberName: string | null;
  memberTodos: Todo[];
}

export function MembersClient({ members, selectedMemberId, selectedMemberName, memberTodos }: MembersClientProps) {
  const router = useRouter();

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-1.5">
        {members.map((member) => (
          <button
            key={member.id}
            onClick={() => router.push(`/members?member=${member.id}`)}
            className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
              selectedMemberId === member.id
                ? "bg-primary/10 border-primary/30 text-foreground"
                : "bg-card border-border hover:bg-card-hover text-foreground"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                selectedMemberId === member.id ? "bg-primary/20 text-primary" : "bg-surface text-muted"
              }`}>
                {member.displayName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-sm">{member.displayName}</p>
                <p className="text-[11px] text-muted">{member.email}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="lg:col-span-2">
        {selectedMemberId ? (
          <>
            <h2 className="text-lg font-semibold mb-4">{selectedMemberName}&apos;s Tasks</h2>
            {memberTodos.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <p>No tasks for this member</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {memberTodos.map((todo) => (
                  <TodoCard key={todo.id} todo={todo} canDelete={false} showCreator />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted">
            <p>Select a member to view their tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
