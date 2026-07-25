# Streaks

A private, personal activity tracker. Define your own trackers (study, work, family, water, anything), log entries from any device, and see a GitHub-style contribution heatmap per month for whichever tracker you select.

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind)
- [Supabase](https://supabase.com) (Postgres + Auth) for data and multi-device sync

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), sign in, and create a new project (free tier is fine).
2. Once it's provisioned, open **SQL Editor** and run the contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). This creates the `trackers` and `entries` tables with row-level security so only you can see your own data.
3. Open **Project Settings → API**. You'll need two values:
   - **Project URL**
   - **anon public** key

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the values from step 1. `.env.local` is gitignored, so these never get committed.

## 3. Enable email auth

In Supabase, go to **Authentication → Providers** and make sure **Email** is enabled (it is by default). This app uses magic-link (passwordless) sign-in — no extra config needed for local development. For production, set **Authentication → URL Configuration → Site URL** to your deployed URL so magic-link emails redirect correctly.

## 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter your email on the login page, and click the magic link sent to your inbox.

## 5. Deploy

Push this repo to GitHub (already done if you're reading this from the repo) and import it into [Vercel](https://vercel.com/new). Add the same two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings. Once deployed, update the Supabase **Site URL** (and add the Vercel URL to **Redirect URLs**) so magic links work in production.

## How it works

- **Trackers** (`/trackers`) — create a tracker with a name, type (`duration` in minutes, or `quantity` with a custom unit), and color. Archive or delete anytime; archiving keeps history intact for past heatmaps.
- **Dashboard** (`/`) — quick-add an entry for any active tracker, and view a monthly heatmap for a selected tracker (color intensity scaled by daily total, hover a day for the exact value).
