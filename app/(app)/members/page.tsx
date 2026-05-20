import { getCurrentUser } from "@/app/lib/auth/jwt";
import { getTeamMembers } from "@/app/lib/actions/teams";
import { getMemberTodos } from "@/app/lib/actions/todos";
import { redirect } from "next/navigation";
import { MembersClient } from "./members-client";

interface Props {
  searchParams: Promise<{ member?: string }>;
}

export default async function MembersPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user || !user.teamId) redirect("/login");

  const params = await searchParams;
  const members = await getTeamMembers(user.teamId);

  let selectedMemberTodos: Awaited<ReturnType<typeof getMemberTodos>> = [];
  const selectedMemberId = params.member;

  if (selectedMemberId) {
    selectedMemberTodos = await getMemberTodos(selectedMemberId, user.teamId);
  }

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Team Members</h1>
      <MembersClient
        members={members}
        selectedMemberId={selectedMemberId ?? null}
        selectedMemberName={selectedMember?.displayName ?? null}
        memberTodos={selectedMemberTodos}
      />
    </div>
  );
}
