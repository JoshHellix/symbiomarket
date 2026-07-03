# Free live demo (no paid Redis / no Blob)

You **do not** need the ~$8 Vercel Upstash plan or a working Blob store to finish Lepton.

---

## Option A — Supabase free (best free public URL)

Supabase **free tier** holds your swarm JSON on Vercel. Same ingest flow as before.

### 1. Create free Supabase project

1. [supabase.com](https://supabase.com) → New project (free tier)
2. Settings → API → copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose in browser)

### 2. Create table

**Easiest:** Supabase → SQL Editor → paste & run the SQL in [SUPABASE_FREE_SETUP.md](./SUPABASE_FREE_SETUP.md) Step 3.

**Or CLI:**

```powershell
cd c:\Users\dell\cursor-symbio\Symbiomarket\arc-nanopayments
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Creates table `symbio_remote_state` (stores keys `swarm` and `fhe`).

Full checklist: **[SUPABASE_FREE_SETUP.md](./SUPABASE_FREE_SETUP.md)**

### 3. Vercel env vars

Add to **symbiomarket** Production:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role |
| `SWARM_INGEST_SECRET` | same as local `.env` |

**Remove** `BLOB_READ_WRITE_TOKEN` if Blob is suspended.

```powershell
npx vercel --prod
```

### 4. Local `.env` (unchanged)

```env
SWARM_INGEST_URL=https://symbiomarket.vercel.app/api/swarm/ingest
SWARM_INGEST_SECRET=...
SWARM_PUSH_EVERY=6
```

### 5. Test

```powershell
python agents/push_swarm_state.py
```

Expect: `[push] ok (supabase)`

---

## Option B — Localhost only ($0)

1. Comment out `SWARM_INGEST_URL` in repo `.env`
2. Run `npm run dev` + `python agents/swarm_api.py`
3. Demo at **http://localhost:3000/swarm**
4. Lepton: strong **video** + **GitHub** + Arc tx links in README  
   Live URL on the form is optional (encouraged, not required)

---

## Option C — Free temporary public URL (ngrok)

Expose localhost for judges for a few hours:

```powershell
ngrok http 3000
```

Use the `https://….ngrok-free.app/swarm` link in your submission while your PC runs the swarm.

---

## Option D — Wait for Blob reset

Blob Hobby access returns **11/07/2026** per Vercel. After that, use `SWARM_PUSH_EVERY=30` (not every cycle) if you stay on Blob.

---

## What we recommend on a budget

| Priority | Path | Cost |
|----------|------|------|
| 1 | **Supabase free** + Vercel | $0 |
| 2 | **localhost + video** | $0 |
| 3 | ngrok for office hours | $0 tier |
| Skip | Paid Upstash on Vercel | ~$8/mo |

Your **x402 Arc payments** and **local swarm** already work — remote storage is only for updating `symbiomarket.vercel.app/swarm` while your laptop runs the engine.
