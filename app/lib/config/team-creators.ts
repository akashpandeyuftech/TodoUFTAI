/**
 * Comma-separated @uftech.com emails allowed to create new teams via the join-team flow.
 * Example: TEAM_CREATOR_EMAILS=akashpandey@uftech.com,ops@uftech.com
 */
export function getTeamCreatorEmails(): string[] {
  const raw = process.env.TEAM_CREATOR_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function emailCanCreateTeams(email: string): boolean {
  return getTeamCreatorEmails().includes(email.trim().toLowerCase());
}
