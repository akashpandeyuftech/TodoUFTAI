import { getCurrentUser } from "@/app/lib/auth/jwt";
import { getMyTodos } from "@/app/lib/actions/todos";
import { redirect } from "next/navigation";
import { MyTodosClient } from "./my-todos-client";

interface Props {
  searchParams: Promise<{ filter?: string; sort?: string }>;
}

export default async function MyTodosPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user || !user.teamId) redirect("/login");

  const params = await searchParams;
  const filter = params.filter ?? "all";
  const sort = params.sort ?? "created";

  const todos = await getMyTodos(user.userId, user.teamId, filter === "all" ? undefined : filter, sort);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">My Todos</h1>
      <MyTodosClient todos={todos} filter={filter} sort={sort} />
    </div>
  );
}
