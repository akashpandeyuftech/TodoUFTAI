import { getCurrentUser } from "@/app/lib/auth/jwt";
import { getMyTodos, getTeamTodos } from "@/app/lib/actions/todos";
import { getTeamMembers } from "@/app/lib/actions/teams";
import { redirect } from "next/navigation";
import { BoardView } from "./board-view";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user || !user.teamId) redirect("/login");

  const [myTodos, teamTodos, members] = await Promise.all([
    getMyTodos(user.userId),
    getTeamTodos(user.teamId),
    getTeamMembers(user.teamId),
  ]);

  return (
    <BoardView
      myTodos={myTodos}
      teamTodos={teamTodos}
      memberCount={members.length}
      userId={user.userId}
    />
  );
}
