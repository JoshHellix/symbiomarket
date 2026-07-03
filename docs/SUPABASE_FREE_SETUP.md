# Supabase free setup — step-by-step

**Goal:** Fix live data at https://symbiomarket.vercel.app/swarm ($0, no paid Redis, no Blob).

**Time:** ~15 minutes once you have a Supabase account.

---

## Step 1 — Create project (free)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Pick a name (e.g. `symbiomarket`), set a DB password, choose a region close to you
3. Wait until the project is **Active**

---

## Step 2 — Copy API keys

Project → **Settings** → **API**

| Copy this | Env variable |
|-----------|----------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon / publishable key | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| service_role key (secret) | `SUPABASE_SERVICE_ROLE_KEY` |

Keep `service_role` server-only — never put it in client code or public repos.

---

## Step 3 — Create the swarm table

### Option A — SQL Editor (easiest, no CLI)

1. Supabase → **SQL Editor** → **New query**
2. Paste and **Run**:

```sql
create table if not exists public.symbio_remote_state (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.symbio_remote_state enable row level security;
```

You should see “Success”. Table holds two keys later: `swarm` and `fhe`.

### Option B — Supabase CLI

```powershell
cd c:\Users\dell\cursor-symbio\Symbiomarket\arc-nanopayments
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Project ref is in the dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`.

---

## Step 4 — Local env (optional, for dashboard dev)

Edit `arc-nanopayments/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Step 5 — Vercel Production env

[Vercel → symbiomarket → Settings → Environment Variables](https://vercel.com)

Add for **Production**:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | from Step 2 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `SWARM_INGEST_SECRET` | same 64-char secret as repo root `.env` |

**Remove** `BLOB_READ_WRITE_TOKEN` if Blob is suspended (avoids failed writes).

Redeploy:

```powershell
cd c:\Users\dell\cursor-symbio\Symbiomarket\arc-nanopayments
npx vercel --prod
```

---

## Step 6 — Verify

### A. Remote storage kind (after deploy)

```powershell
curl https://symbiomarket.vercel.app/api/swarm/meta
```

Expect JSON like:

```json
{"source":"empty","storage":"supabase","ingestEnabled":true,"vercel":true}
```

`storage: "supabase"` means Vercel is wired correctly.

### B. Push from your laptop

Repo root `.env` must have:

```env
SWARM_INGEST_URL=https://symbiomarket.vercel.app/api/swarm/ingest
SWARM_INGEST_SECRET=<same as Vercel>
SWARM_PUSH_EVERY=6
```

```powershell
cd c:\Users\dell\cursor-symbio\Symbiomarket
python agents/push_swarm_state.py
```

Expect: `[push] ok (supabase)`

### C. Live page

Open https://symbiomarket.vercel.app/swarm — agents, cycles, and payments should update after push or while `python agents/swarm_api.py` runs.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `[push] HTTP 500` Blob access denied | Push URL hits an **old** deployment. Check `https://YOUR-DOMAIN/api/swarm/meta` — need `"storage":"supabase"`. Update `SWARM_INGEST_URL` in repo `.env` to match that domain, or re-attach `symbiomarket.vercel.app` in Vercel → Settings → Domains. |
| `[push] failed 401` | `SWARM_INGEST_SECRET` mismatch between `.env` and Vercel |
| `[push] failed 500` | Missing `SUPABASE_SERVICE_ROLE_KEY` on Vercel, or table not created |
| `storage: "none"` | Supabase URL + service role not set on Vercel; redeploy after adding |
| `storage: "blob"` | Remove `BLOB_READ_WRITE_TOKEN`; add Supabase vars |
| Dashboard errors locally | Add Supabase keys to `.env.local` or use `/swarm` only |

---

## What this stores

Only JSON snapshots for the public swarm view (`swarm_data.json` + optional FHE sync). Payment events on Arc are separate (on-chain + local logs). Free tier is enough for Lepton demo traffic.
