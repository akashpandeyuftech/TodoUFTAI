# UFTech Tasks

Team todo management app for UFTech. Built with Next.js (App Router), Drizzle ORM, Neon PostgreSQL, and JWT auth.

## Tech Stack

- **Framework:** Next.js (App Router, Server Actions)
- **Database:** Neon (PostgreSQL, serverless)
- **ORM:** Drizzle ORM
- **Auth:** JWT via `jose`, httpOnly cookies
- **Validation:** Zod
- **PDF Export:** @react-pdf/renderer
- **Styling:** Tailwind CSS v4 (smoke/black & white palette, Inter / JetBrains Mono)
- **Deployment:** Vercel

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/akashpandeyuftech/TodoUFTAI.git
cd TodoUFTAI
npm install
```

### 2. Set up environment

```bash
cp .env.local.example .env.local
```

Fill in Neon database URLs, JWT secret, and app URL.

**Team bootstrap:** Add one or more emails to `TEAM_CREATOR_EMAILS` (comma-separated, `@uftech.com`). Those users see **Create team** on the Join Team page. No IDs or accounts are hardcoded.

### 3. Push database schema

```bash
npm run db:push
```

This applies the schema (including `claimed_by_user_id` on todos and claim history actions).

### 4. Optional seed script

```bash
npm run db:seed
```

Runs a no-op log only — register users in the app instead of relying on seeded dummy data.

### 5. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Auth Rules

- All emails must end with `@uftech.com`
- Users must join exactly one team after registration (cannot be changed)
- JWT stored in httpOnly secure cookie
- Protected routes via middleware

## Features

- **Top navbar** — Board, tasks, members, history, export; mobile menu for small screens
- **Dashboard board** — Add personal tasks, add team tasks, drag **unclaimed** team tasks into **My Tasks** (pick them up); drag claimed tasks back onto **Team Tasks** (return to pool). Team column shows **Taken — {name}** when someone picked up a task
- **Personal + team todos** — Full workflow with filtering and sorting on dedicated pages
- **Member view** — See any team member's personal todos
- **Team creators** — Emails listed in `TEAM_CREATOR_EMAILS` may create teams (not hardcoded per person)
- **History** — Audit trail including **Taken** / **Returned to pool**
- **PDF Export** — Cover page, todos, optional history

## Project Structure

```
app/
  (auth)/          — Login and register pages
  (app)/           — Protected app pages (dashboard, todos, etc.)
  api/auth/        — Auth API routes
  components/      — Reusable UI (`app-navbar`, todos, …)
  lib/
    db/            — Drizzle schema and client
    config/        — e.g. team creator allowlist parsing
    auth/          — JWT helpers
    validators/    — Zod schemas
    actions/       — Server actions
middleware.ts      — JWT route protection
scripts/seed.ts    — Empty / informational only
drizzle.config.ts  — Drizzle Kit config
```

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` — Neon pooled connection string
   - `DATABASE_URL_UNPOOLED` — Neon direct connection string
   - `JWT_SECRET` — 32+ char random string
   - `NEXT_PUBLIC_APP_URL` — Your deployed URL
   - `TEAM_CREATOR_EMAILS` — Comma-separated @uftech.com addresses allowed to create teams
4. Run `npm run db:push` so production DB matches schema
5. Deploy

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:push` | Push Drizzle schema to database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | No-op informational script |
