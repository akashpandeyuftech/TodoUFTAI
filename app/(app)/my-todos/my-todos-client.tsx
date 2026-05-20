"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TodoList } from "@/app/components/todos/todo-list";

interface Todo {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | Date | null;
  priority: "low" | "medium" | "high";
  ownerType: "member" | "team";
  ownerId: string;
  createdBy: string;
  creatorName: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export function MyTodosClient({ todos, filter, sort }: { todos: Todo[]; filter: string; sort: string }) {
  const router = useRouter();
  const params = useSearchParams();

  function updateParam(key: string, value: string) {
    const newParams = new URLSearchParams(params.toString());
    newParams.set(key, value);
    router.push(`/my-todos?${newParams.toString()}`);
  }

  return (
    <TodoList
      todos={todos}
      ownerType="member"
      filter={filter}
      sort={sort}
      onFilterChange={(f) => updateParam("filter", f)}
      onSortChange={(s) => updateParam("sort", s)}
    />
  );
}
