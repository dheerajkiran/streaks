# Streaks

A personal activity tracker for logging how a day actually gets spent — study, work, family, water, sleep, or any custom metric — from any device, with a GitHub-style contribution heatmap and a 24-hour view of the day.

> Private project, built for personal use. See [ARCHITECTURE.md](ARCHITECTURE.md) for how it's put together.

## Features

- **Custom trackers, anytime** — create or archive a tracker whenever a new thing is worth tracking. Three types:
  - **Duration** — minutes, logged either as a raw number or as a start–end time range
  - **Quantity** — a number with your own unit (glasses, pages, reps, ...)
  - **Time of day** — a single point-in-time event (wake-up time, sleep time)
- **Quick-add logging** — log the same tracker multiple times a day (e.g. a work session before and after a break); totals combine automatically
- **Monthly heatmap** — GitHub-contribution-style calendar for any tracker, color intensity scaled by daily total
- **Today panel** — total time tracked today, a bar per duration tracker, and stat tiles for quantity/time-of-day trackers
- **24-hour timeline** — a 12 AM–11:59 PM view of today, colored by tracker, showing what was logged when
- **Entry log** — every individual entry, with its logged time, editable/deletable
- **Multi-device** — sign in from a laptop, phone, or iPad; data lives in one shared database, not on any one device

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router, TypeScript, Tailwind CSS)
- [Supabase](https://supabase.com) (Postgres + Auth) for data storage, row-level security, and cross-device sync
- [Vercel](https://vercel.com) for hosting/deployment

## Getting started

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), sign in, and create a new project (free tier is fine).
2. Open **SQL Editor** and run each file in [`supabase/migrations/`](supabase/migrations) in order (`0001`, `0002`, `0003`, ...). Each one is a small, additive schema change — see [ARCHITECTURE.md](ARCHITECTURE.md#migrations) for what each does.
3. Open **Project Settings → API Keys**. You'll need:
   - **Project URL**
   - **anon / public** (or **publishable**) key — never the `service_role`/**secret** key

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the values from step 1. `.env.local` is gitignored and never committed.

### 3. Enable auth

In Supabase, go to **Authentication → Providers** and confirm **Email** is enabled (default). The app supports both magic-link (passwordless) and password sign-in. For production, set **Authentication → URL Configuration → Site URL** to your deployed URL, and add it under **Redirect URLs** too, so magic-link emails redirect correctly.

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

## Deployment

Connected to Vercel via its GitHub integration: every push to `main` auto-builds and deploys. To set up your own deployment, import this repo on [Vercel](https://vercel.com/new) and add the same two environment variables in the project's settings. See [ARCHITECTURE.md](ARCHITECTURE.md#deployment-pipeline) for the full flow.

## Project structure

```
src/
  app/
    (dashboard)/        # authenticated routes: dashboard, /trackers
    actions/             # server actions (auth, trackers, entries)
    auth/confirm/        # magic-link / OAuth callback route
    login/                # sign-in page
  components/            # UI components (heatmap, timeline, forms, ...)
  lib/                    # Supabase clients, shared types, chart helpers
  proxy.ts                # session-refresh + route protection (Next.js 16's renamed middleware)
supabase/migrations/      # SQL schema, applied in order
```
