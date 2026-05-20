/**
 * Emails that may create teams on /join-team in addition to `TEAM_CREATOR_EMAILS`.
 * Kept in code so the primary org contact can always bootstrap teams without env drift.
 */
const BUILTIN_TEAM_CREATOR_EMAILS = ["akashpandey@uftech.com"] as const;

/**
 * Built-in allowlist plus comma-separated `TEAM_CREATOR_EMAILS` (@uftech.com).
 * Example env: TEAM_CREATOR_EMAILS=ops@uftech.com,lead@uftech.com
 */
export function getTeamCreatorEmails(): string[] {
  const raw = process.env.TEAM_CREATOR_EMAILS ?? "";
  const fromEnv = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const builtin = BUILTIN_TEAM_CREATOR_EMAILS.map((e) => e.toLowerCase());
  return [...new Set([...builtin, ...fromEnv])];
}

export function emailCanCreateTeams(email: string): boolean {
  return getTeamCreatorEmails().includes(email.trim().toLowerCase());
}
