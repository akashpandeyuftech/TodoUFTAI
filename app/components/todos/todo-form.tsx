"use client";

import { useTransition, useRef, useEffect } from "react";
import { createTodo, updateTodo } from "@/app/lib/actions/todos";
import { useToast } from "../ui/toast";

interface TodoFormProps {
  ownerType: "member" | "team";
  editingTodo?: {
    id: string;
    title: string;
    description: string | null;
    dueDate: string | Date | null;
    priority: "low" | "medium" | "high";
    ownerType?: "member" | "team";
  } | null;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function TodoForm({ ownerType, editingTodo, onCancel, onSuccess }: TodoFormProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (editingTodo) titleRef.current?.focus();
  }, [editingTodo]);

  function handleSubmit(formData: FormData) {
    const effectiveOwner = editingTodo?.ownerType ?? ownerType;
    formData.set("owner_type", effectiveOwner);
    startTransition(async () => {
      let result;
      if (editingTodo) {
        result = await updateTodo(editingTodo.id, formData);
      } else {
        result = await createTodo(formData);
      }
      if (result?.error) {
        toast(result.error, "error");
      } else {
        toast(editingTodo ? "Todo updated" : "Todo created");
        formRef.current?.reset();
        onSuccess?.();
      }
    });
  }

  const dueValue = editingTodo?.dueDate
    ? new Date(editingTodo.dueDate).toISOString().split("T")[0]
    : "";

  const inputClass =
    "w-full px-3 py-2 bg-[#111] border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/25";

  return (
    <form ref={formRef} action={handleSubmit} className="bg-surface border border-border rounded-xl p-4 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <input
            ref={titleRef}
            name="title"
            placeholder="Task title..."
            defaultValue={editingTodo?.title ?? ""}
            required
            maxLength={200}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <textarea
            name="description"
            placeholder="Description (optional)"
            defaultValue={editingTodo?.description ?? ""}
            maxLength={1000}
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted mb-1 uppercase tracking-wider">Priority</label>
          <select name="priority" defaultValue={editingTodo?.priority ?? "medium"} className={inputClass}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted mb-1 uppercase tracking-wider">Due Date</label>
          <input name="due_date" type="date" defaultValue={dueValue} className={inputClass} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground cursor-pointer">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 disabled:opacity-50 cursor-pointer transition-colors"
        >
          {isPending ? "Saving..." : editingTodo ? "Update" : "Add Task"}
        </button>
      </div>
    </form>
  );
}
