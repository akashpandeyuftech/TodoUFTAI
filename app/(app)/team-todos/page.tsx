import { getCurrentUser } from "@/app/lib/auth/jwt";
import { getTeamTodos } from "@/app/lib/actions/todos";
import { redirect } from "next/navigation";
import { TeamTodosClient } from "./team-todos-client";

interface Props {
  searchParams: Promise<{ filter?: string; sort?: string }>;
}

export default async function TeamTodosPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user || !user.teamId) redirect("/login");

  const params = await searchParams;
  const filter = params.filter ?? "all";
  const sort = params.sort ?? "created";

  const todos = await getTeamTodos(user.teamId, filter === "all" ? undefined : filter, sort);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Team Todos</h1>
      <TeamTodosClient todos={todos} filter={filter} sort={sort} />
    </div>
  );
}
