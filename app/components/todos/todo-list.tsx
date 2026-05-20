"use client";

import { useState } from "react";
import { TodoCard } from "./todo-card";
import { TodoForm } from "./todo-form";

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
  claimantDisplayName?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface TodoListProps {
  todos: Todo[];
  ownerType: "member" | "team";
  canEdit?: boolean;
  canDelete?: boolean;
  /** When set, overrides `canDelete` per row */
  resolveCanDelete?: (todo: Todo) => boolean;
  showCreator?: boolean;
  showForm?: boolean;
  filter?: string;
  sort?: string;
  onFilterChange?: (filter: string) => void;
  onSortChange?: (sort: string) => void;
}

export function TodoList({
  todos,
  ownerType,
  canEdit = true,
  canDelete = true,
  resolveCanDelete,
  showCreator = false,
  showForm = true,
  filter,
  sort,
  onFilterChange,
  onSortChange,
}: TodoListProps) {
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  return (
    <div className="space-y-4">
      {(onFilterChange || onSortChange) && (
        <div className="flex flex-wrap gap-3">
          {onFilterChange && (
            <div className="flex gap-0.5 bg-surface rounded-lg p-1 border border-border">
              {["all", "active", "completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => onFilterChange(f)}
                  className={`px-3 py-1.5 text-[11px] font-medium rounded-md capitalize cursor-pointer transition-colors ${
                    filter === f ? "bg-primary/15 text-primary" : "text-muted hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
          {onSortChange && (
            <select
              value={sort ?? "created"}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-[11px] bg-surface border border-border rounded-lg px-3 py-1.5 text-muted"
            >
              <option value="created">Newest first</option>
              <option value="due_date">By due date</option>
              <option value="priority">By priority</option>
            </select>
          )}
        </div>
      )}

      {showForm && !showNewForm && !editingTodo && (
        <button
          onClick={() => setShowNewForm(true)}
          className="w-full border-2 border-dashed border-border rounded-xl p-4 text-muted hover:text-primary hover:border-primary/40 transition-colors text-sm font-medium cursor-pointer"
        >
          + Add new task
        </button>
      )}

      {showNewForm && (
        <TodoForm ownerType={ownerType} onCancel={() => setShowNewForm(false)} onSuccess={() => setShowNewForm(false)} />
      )}

      {editingTodo && (
        <TodoForm
          ownerType={editingTodo.ownerType}
          editingTodo={editingTodo}
          onCancel={() => setEditingTodo(null)}
          onSuccess={() => setEditingTodo(null)}
        />
      )}

      {todos.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-lg font-medium">No tasks yet</p>
          <p className="text-sm mt-1">Create your first one above</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onEdit={canEdit ? () => setEditingTodo(todo) : undefined}
              canDelete={resolveCanDelete ? resolveCanDelete(todo) : canDelete}
              badge={!showCreator && todo.ownerType === "team" && todo.claimedByUserId ? "Team • picked up" : undefined}
              takenByLabel={
                showCreator && todo.ownerType === "team" && todo.claimedByUserId && todo.claimantDisplayName
                  ? `Taken — ${todo.claimantDisplayName}`
                  : undefined
              }
              showCreator={showCreator}
            />
          ))}
        </div>
      )}
    </div>
  );
}
