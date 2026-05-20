import { config } from "dotenv";
config({ path: ".env.local" });

/** Intentionally no dummy data: register accounts in the app and create teams via TEAM_CREATOR_EMAILS. */

async function seed() {
  console.log("[db:seed] No seed data is written.");
  console.log("- Register users via /register");
  console.log("- Set TEAM_CREATOR_EMAILS in .env.local for who may create teams on /join-team");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
