import { z } from "zod";

const uftechEmail = /^[a-zA-Z0-9._%+-]+@uftech\.com$/;

export const registerSchema = z.object({
  email: z.string().regex(uftechEmail, "Must be a @uftech.com email"),
  password: z.string().min(8, "Minimum 8 characters"),
  display_name: z.string().min(2, "Minimum 2 characters").max(50, "Maximum 50 characters"),
});

export const loginSchema = z.object({
  email: z.string().regex(uftechEmail, "Must be a @uftech.com email"),
  password: z.string().min(1, "Password required"),
});

export const todoSchema = z.object({
  title: z.string().min(1, "Title required").max(200),
  description: z.string().max(1000).optional().nullable(),
  due_date: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]),
  owner_type: z.enum(["member", "team"]),
});

export const updateTodoSchema = todoSchema.partial().extend({
  is_completed: z.boolean().optional(),
});

export const joinTeamSchema = z.object({
  team_id: z.string().uuid(),
});

export const createTeamSchema = z.object({
  name: z.string().min(2, "Name too short").max(80),
  description: z.string().max(500).optional().nullable(),
});
