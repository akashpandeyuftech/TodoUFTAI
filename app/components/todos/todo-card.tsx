"use client";

import { useState, useTransition } from "react";
import { toggleTodo, deleteTodo } from "@/app/lib/actions/todos";
import { useToast } from "../ui/toast";

interface Todo {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | Date | null;
  priority: "low" | "medium" | "high";
  ownerType: "member" | "team";
  ownerId: string;
  createdBy?: string;
  creatorName: string | null;
  claimedByUserId?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface TodoCardProps {
  todo: Todo;
  onEdit?: (todo: Todo) => void;
  canDelete?: boolean;
  showCreator?: boolean;
  /** Small pill under title area */
  badge?: string;
  /** Shown instead of inferred creator line when set */
  takenByLabel?: string;
  /** Claim/release actions for team tasks */
  onClaim?: () => void;
  onRelease?: () => void;
}

const priorityConfig = {
  high: { bg: "bg-white/10", text: "text-foreground", dot: "bg-white" },
  medium: { bg: "bg-white/[0.06]", text: "text-muted", dot: "bg-muted" },
  low: { bg: "bg-white/[0.04]", text: "text-muted", dot: "bg-border" },
};

export function TodoCard({
  todo,
  onEdit,
  canDelete = true,
  showCreator = false,
  badge,
  takenByLabel,
  onClaim,
  onRelease,
}: TodoCardProps) {
  const [optimisticCompleted, setOptimisticCompleted] = useState(todo.isCompleted);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  function handleToggle() {
    setOptimisticCompleted(!optimisticCompleted);
    startTransition(async () => {
      const result = await toggleTodo(todo.id);
      if (result?.error) {
        setOptimisticCompleted(todo.isCompleted);
        toast(result.error, "error");
      }
    });
  }

  async function handleDelete() {
    if (!confirm("Delete this todo?")) return;
    setIsDeleting(true);
    const result = await deleteTodo(todo.id);
    if (result?.error) {
      toast(result.error, "error");
      setIsDeleting(false);
    } else {
      toast("Todo deleted");
    }
  }

  const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
  const isOverdue = dueDate && !optimisticCompleted && dueDate < new Date();
  const p = priorityConfig[todo.priority];

  return (
    <div
      className={`bg-card border border-border rounded-lg p-2.5 transition-all hover:bg-card-hover hover:border-border/80 group ${
        isDeleting ? "opacity-40 scale-95" : ""
      } ${optimisticCompleted ? "opacity-60" : ""}`}
      style={{ animation: "fade-in 0.2s ease-out" }}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`mt-0.5 w-[15px] h-[15px] rounded-[4px] border-[1.5px] flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            optimisticCompleted
              ? "bg-primary border-primary text-white"
              : "border-muted/40 hover:border-primary"
          }`}
        >
          {optimisticCompleted && (
            <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`text-[11px] font-medium leading-snug ${optimisticCompleted ? "line-through text-muted" : "text-foreground"}`}>
            {todo.title}
          </h3>
          {todo.description && (
            <p className="text-[10px] text-muted mt-0.5 line-clamp-2 leading-relaxed">{todo.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className={`text-[9px] font-semibold px-1.5 py-px rounded-full flex items-center gap-1 ${p.bg} ${p.text}`}>
              <span className={`w-1 h-1 rounded-full ${p.dot}`} />
              {todo.priority}
            </span>

            {dueDate && (
              <span className={`text-[9px] ${isOverdue ? "text-danger font-semibold" : "text-muted"}`}>
                {isOverdue ? "Overdue: " : "Due: "}
                {dueDate.toLocaleDateString()}
              </span>
            )}

            {badge && (
              <span className="text-[9px] font-medium uppercase tracking-wide text-muted border border-border rounded px-1.5 py-px">
                {badge}
              </span>
            )}

            {takenByLabel && <span className="text-[9px] text-foreground">{takenByLabel}</span>}

            {showCreator && todo.creatorName && (
              <span className="text-[9px] text-muted">by {todo.creatorName}</span>
            )}
          </div>

          {(onClaim || onRelease) && (
            <div className="mt-1.5">
              {onClaim && (
                <button
                  onClick={onClaim}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-white/10 text-foreground hover:bg-white/20 cursor-pointer transition-colors"
                >
                  Take Task
                </button>
              )}
              {onRelease && (
                <button
                  onClick={onRelease}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-white/[0.06] text-muted hover:bg-white/10 hover:text-foreground cursor-pointer transition-colors"
                >
                  Return Task
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(todo)}
              className="text-muted hover:text-primary p-1 rounded-md hover:bg-primary/10 cursor-pointer transition-colors"
              title="Edit"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 2l3 3L5 14H2v-3L11 2z" />
              </svg>
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-muted hover:text-danger p-1 rounded-md hover:bg-danger/10 cursor-pointer transition-colors"
              title="Delete"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h10M5 6V4a1 1 0 011-1h4a1 1 0 011 1v2m2 0v8a1 1 0 01-1 1H4a1 1 0 01-1-1V6h12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
