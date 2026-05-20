import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";
import * as schema from "../app/lib/db/schema";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("Seeding database...");

  // Create teams
  const teamData = [
    { id: uuid(), name: "Frontend Team", description: "UI/UX and client-side development" },
    { id: uuid(), name: "Backend Team", description: "APIs, services, and infrastructure" },
    { id: uuid(), name: "DevOps Team", description: "CI/CD, monitoring, and deployment" },
  ];

  await db.insert(schema.teams).values(teamData).onConflictDoNothing();
  console.log("Created 3 teams");

  // Create users (2 per team)
  const password = await hash("password123", 10);
  const userData = [
    { id: uuid(), email: "alice@uftech.com", passwordHash: password, displayName: "Alice", teamId: teamData[0].id },
    { id: uuid(), email: "bob@uftech.com", passwordHash: password, displayName: "Bob", teamId: teamData[0].id },
    { id: uuid(), email: "charlie@uftech.com", passwordHash: password, displayName: "Charlie", teamId: teamData[1].id },
    { id: uuid(), email: "diana@uftech.com", passwordHash: password, displayName: "Diana", teamId: teamData[1].id },
    { id: uuid(), email: "eve@uftech.com", passwordHash: password, displayName: "Eve", teamId: teamData[2].id },
    { id: uuid(), email: "frank@uftech.com", passwordHash: password, displayName: "Frank", teamId: teamData[2].id },
  ];

  await db.insert(schema.users).values(userData).onConflictDoNothing();
  console.log("Created 6 users");

  // Create personal todos (3 per user)
  const priorities: ("low" | "medium" | "high")[] = ["low", "medium", "high"];
  const personalTodos = userData.flatMap((user, ui) => [
    {
      id: uuid(),
      title: `${user.displayName}'s task: Review PR`,
      description: "Review the latest pull request",
      isCompleted: false,
      priority: priorities[0],
      ownerType: "member" as const,
      ownerId: user.id,
      createdBy: user.id,
      dueDate: new Date(Date.now() + 86400000 * (ui + 1)),
    },
    {
      id: uuid(),
      title: `${user.displayName}'s task: Write tests`,
      description: "Add unit tests for new module",
      isCompleted: true,
      priority: priorities[1],
      ownerType: "member" as const,
      ownerId: user.id,
      createdBy: user.id,
      dueDate: new Date(Date.now() - 86400000),
    },
    {
      id: uuid(),
      title: `${user.displayName}'s task: Update docs`,
      description: null,
      isCompleted: false,
      priority: priorities[2],
      ownerType: "member" as const,
      ownerId: user.id,
      createdBy: user.id,
      dueDate: new Date(Date.now() + 86400000 * 7),
    },
  ]);

  await db.insert(schema.todos).values(personalTodos);
  console.log("Created 18 personal todos");

  // Create team todos (3 per team)
  const teamTodos = teamData.flatMap((team, ti) => [
    {
      id: uuid(),
      title: `[${team.name}] Sprint planning`,
      description: "Plan the next sprint",
      isCompleted: false,
      priority: priorities[2],
      ownerType: "team" as const,
      ownerId: team.id,
      createdBy: userData[ti * 2].id,
      dueDate: new Date(Date.now() + 86400000 * 3),
    },
    {
      id: uuid(),
      title: `[${team.name}] Standup notes`,
      description: "Document standup takeaways",
      isCompleted: true,
      priority: priorities[0],
      ownerType: "team" as const,
      ownerId: team.id,
      createdBy: userData[ti * 2 + 1].id,
      dueDate: null,
    },
    {
      id: uuid(),
      title: `[${team.name}] Retro action items`,
      description: "Follow up on retro items from last cycle",
      isCompleted: false,
      priority: priorities[1],
      ownerType: "team" as const,
      ownerId: team.id,
      createdBy: userData[ti * 2].id,
      dueDate: new Date(Date.now() + 86400000 * 14),
    },
  ]);

  await db.insert(schema.todos).values(teamTodos);
  console.log("Created 9 team todos");

  // Create history entries for each todo
  const allTodos = [...personalTodos, ...teamTodos];
  const historyEntries: {
    id: string; todoId: string; changedBy: string;
    action: "created" | "updated" | "completed" | "uncompleted" | "deleted";
    previousState: Record<string, unknown> | null; newState: Record<string, unknown> | null;
  }[] = allTodos.map((todo) => ({
    id: uuid(),
    todoId: todo.id,
    changedBy: todo.createdBy,
    action: "created" as const,
    previousState: null,
    newState: {
      title: todo.title,
      description: todo.description,
      isCompleted: todo.isCompleted,
      priority: todo.priority,
      ownerType: todo.ownerType,
      ownerId: todo.ownerId,
    },
  }));

  // Add completion history for completed todos
  const completedTodos = allTodos.filter((t) => t.isCompleted);
  completedTodos.forEach((todo) => {
    historyEntries.push({
      id: uuid(),
      todoId: todo.id,
      changedBy: todo.createdBy,
      action: "completed" as const,
      previousState: { isCompleted: false },
      newState: { isCompleted: true },
    });
  });

  await db.insert(schema.todoHistory).values(historyEntries);
  console.log(`Created ${historyEntries.length} history entries`);

  console.log("\nSeed complete! Sample login: alice@uftech.com / password123");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
