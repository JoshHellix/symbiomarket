# Upstash Redis for live `/swarm` on Vercel

> **On a budget?** Skip this doc if Vercel quotes ~$8/mo. Use **[`FREE_LIVE_DEMO.md`](FREE_LIVE_DEMO.md)** (Supabase free or localhost) instead.

Use this when Upstash is **free** on your Vercel plan. The app prefers Redis when `KV_REST_*` env vars are set.

**Production URL:** https://symbiomarket.vercel.app/swarm

---

## Step 1 — Add Upstash on Vercel

1. Open [Vercel → symbiomarket → Storage](https://vercel.com/hellix-nebulla-s-projects/symbiomarket/stores)
2. Click **Create Database** (or **Browse Storage**)
3. Choose **Upstash** → **Upstash Redis**
4. Name it e.g. `symbio-kv` → region close to you → **Create**
5. When prompted, **Connect to Project** → select **symbiomarket** → check **Production** (and Preview if you want)

Vercel adds these automatically to the project:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

(Optional legacy names may appear as `UPSTASH_REDIS_REST_URL` — our code uses `KV_REST_*`.)

---

## Step 2 — Stop using Blob (optional but recommended)

1. Vercel → **symbiomarket** → **Settings** → **Environment Variables**
2. **Remove** `BLOB_READ_WRITE_TOKEN` from Production (or leave it — Redis is used first when both exist)
3. Leave the suspended `symbio-live` Blob store disconnected; you do not need to delete files

---

## Step 3 — Confirm ingest secret

Same secret in **two places**:

| Where | Variable |
|-------|----------|
| Vercel → Environment Variables | `SWARM_INGEST_SECRET` |
| Repo root `.env` (local) | `SWARM_INGEST_SECRET` |

Generate once if needed (PowerShell):

```powershell
-join ((48..57 + 65..70 + 97..102) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Or use any long random string you already set on Vercel.

---

## Step 4 — Redeploy

```powershell
cd c:\Users\dell\cursor-symbio\Symbiomarket\arc-nanopayments
npx vercel --prod
```

---

## Step 5 — Local `.env` (repo root)

```env
SWARM_INGEST_URL=https://symbiomarket.vercel.app/api/swarm/ingest
SWARM_INGEST_SECRET=same-as-vercel
SWARM_PUSH_EVERY=6
```

`SWARM_PUSH_EVERY=6` pushes every 6th cycle (~72s with 12s cycles) so you stay inside free-tier limits.

---

## Step 6 — Run swarm

```powershell
cd c:\Users\dell\cursor-symbio\Symbiomarket\agents
python swarm_api.py
```

Look for:

```text
[ok] Cycle 6 -> swarm updated + pushed to Vercel (kv)
```

Cycles between pushes:

```text
[ok] Cycle 3 -> swarm updated (push skipped — next at cycle 6)
```

---

## Step 7 — Verify

1. Open https://symbiomarket.vercel.app/swarm — cycle counter should move after a push
2. Or test ingest manually:

```powershell
cd c:\Users\dell\cursor-symbio\Symbiomarket
python agents/push_swarm_state.py
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `HTTP 500` Blob suspended | Complete Steps 1–4; ensure `KV_REST_*` on Vercel |
| `HTTP 401` | `SWARM_INGEST_SECRET` mismatch local vs Vercel |
| `/swarm` empty | Wait for cycle 1 or 6, or run `push_swarm_state.py` once |
| Still slow quota | Increase `SWARM_PUSH_EVERY` to `12` or `30` |

---

## Why Redis beats Blob here

| | Blob (Hobby) | Upstash Redis |
|--|--------------|---------------|
| Each swarm update | `put` = advanced operation | `SET` one key |
| Your failure mode | 5k / 2k ops exceeded | Much higher free allowance for this pattern |
| Data size | Fine for 6 KB JSON | Fine for 6 KB JSON |
