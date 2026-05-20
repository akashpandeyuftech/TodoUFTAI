import { getCurrentUser } from "@/app/lib/auth/jwt";
import { getHistory } from "@/app/lib/actions/history";
import { getTeamMembers } from "@/app/lib/actions/teams";
import { redirect } from "next/navigation";
import { HistoryClient } from "./history-client";

interface Props {
  searchParams: Promise<{ mode?: string; member?: string; page?: string }>;
}

export default async function HistoryPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user || !user.teamId) redirect("/login");

  const params = await searchParams;
  const mode = (params.mode ?? "mine") as "mine" | "team" | "member";
  const memberId = params.member;
  const page = parseInt(params.page ?? "1", 10);

  const members = await getTeamMembers(user.teamId);
  const history = await getHistory({
    userId: user.userId,
    teamId: user.teamId,
    mode,
    memberId,
    page,
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">History</h1>
      <HistoryClient
        entries={history.entries}
        totalPages={history.totalPages}
        currentPage={page}
        mode={mode}
        memberId={memberId ?? null}
        members={members}
      />
    </div>
  );
}
