import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);
export const ownerTypeEnum = pgEnum("owner_type", ["member", "team"]);
export const actionEnum = pgEnum("action", [
  "created",
  "updated",
  "completed",
  "uncompleted",
  "deleted",
]);

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").unique().notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  teamId: uuid("team_id").references(() => teams.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const todos = pgTable("todos", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  priority: priorityEnum("priority").default("medium").notNull(),
  ownerType: ownerTypeEnum("owner_type").notNull(),
  ownerId: uuid("owner_id").notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const todoHistory = pgTable("todo_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  todoId: uuid("todo_id")
    .references(() => todos.id, { onDelete: "cascade" })
    .notNull(),
  changedBy: uuid("changed_by")
    .references(() => users.id)
    .notNull(),
  action: actionEnum("action").notNull(),
  previousState: jsonb("previous_state"),
  newState: jsonb("new_state"),
  changedAt: timestamp("changed_at", { withTimezone: true }).defaultNow().notNull(),
});
