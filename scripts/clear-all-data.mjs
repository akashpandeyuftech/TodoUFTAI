/**
 * Wipes ALL teams, users, todos, and history from the connected database.
 * Usage: npm run db:clear-all
 * Loads .env.local then .env (same order as Drizzle seeding patterns).
 */

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
config({ path: join(root, ".env.local") });
config({ path: join(root, ".env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(url);

console.log("Truncating todo_history, todos, users, teams (CASCADE)…");

await sql`TRUNCATE todo_history, todos, users, teams RESTART IDENTITY CASCADE`;

console.log("Done. All app data removed.");
