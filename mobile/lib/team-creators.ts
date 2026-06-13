const BUILTIN_CREATORS = ["akashpandey@uftech.com"];

export function emailCanCreateTeams(email: string): boolean {
  return BUILTIN_CREATORS.includes(email.trim().toLowerCase());
}
