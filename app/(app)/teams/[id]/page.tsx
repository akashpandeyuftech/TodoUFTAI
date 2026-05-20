import { getCurrentUser } from "@/app/lib/auth/jwt";
import { getTeamById, getTeamMembers } from "@/app/lib/actions/teams";
import { emailCanCreateTeams } from "@/app/lib/config/team-creators";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TeamDetailPage({ params }: Props) {
  const auth = await getCurrentUser();
  if (!auth) redirect("/login");
  if (!emailCanCreateTeams(auth.email)) redirect("/dashboard");

  const { id } = await params;
  const team = await getTeamById(id);
  if (!team) notFound();

  const members = await getTeamMembers(team.id);

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/teams"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-4"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Back to teams
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          {team.description && <p className="text-sm text-muted mt-1">{team.description}</p>}
          <p className="text-xs text-muted mt-2">
            Created {new Date(team.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Members ({members.length})
        </h2>

        {members.length === 0 ? (
          <div className="text-center py-10 text-muted border border-border border-dashed rounded-xl">
            <p className="text-lg font-medium text-foreground">No members yet</p>
            <p className="text-sm mt-1">Members will appear here once they join this team.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-card-hover transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 border border-border flex items-center justify-center text-[11px] font-semibold text-white shrink-0">
                  {member.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {member.displayName}
                  </p>
                  <p className="text-xs text-muted truncate">{member.email}</p>
                </div>
                <p className="text-[11px] text-muted ml-auto shrink-0">
                  Joined {new Date(member.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
