# Deploy `/swarm` to Vercel

The **Python swarm cannot run on Vercel** (serverless, no long-lived processes). Architecture:

```
Your PC (WSL)                    Vercel
python3 agents/swarm_api.py  →   POST /api/swarm/ingest  →  Upstash Redis (KV)
     every ~6s                         ↑
                                  GET /api/swarm/state
                                  GET /api/fhe/state
                                       ↓
                              https://YOUR_APP.vercel.app/swarm
```

---

## 1. Deploy Next.js (one time)

```powershell
cd c:\Users\dell\cursor-symbio\Symbiomarket\arc-nanopayments
npm install
npx vercel login
npx vercel link
npx vercel --prod
```

**Production URL:** https://symbiomarket.vercel.app/swarm

---

## 2. Add storage on Vercel (required for live data)

**Recommended — Upstash Redis:** see **[`UPSTASH_SETUP.md`](UPSTASH_SETUP.md)** (step-by-step).

1. [Storage](https://vercel.com/hellix-nebulla-s-projects/symbiomarket/stores) → **Upstash Redis** → connect to **Production**
2. Adds `KV_REST_API_URL` + `KV_REST_API_TOKEN`
3. Remove `BLOB_READ_WRITE_TOKEN` if Blob is suspended
4. `npx vercel --prod`

**Legacy — Vercel Blob:** low Hobby **advanced-ops** limit; not suitable for per-cycle push.

---

## 2b. Throttle Vercel pushes (repo `.env`)

```env
SWARM_PUSH_EVERY=6
```

Pushes on cycles **1, 6, 12, …** (~once per minute at 12s/cycle). Set `1` for every cycle (not recommended on Hobby).

---

## 3. Set Vercel environment variables

| Variable | Value |
|----------|--------|
| `SWARM_INGEST_SECRET` | Long random string (e.g. `openssl rand -hex 32`) |
| `KV_REST_API_URL` | Auto from Redis integration |
| `KV_REST_API_TOKEN` | Auto from Redis integration |

Redeploy after adding env vars: `npx vercel --prod`.

---

## 4. Local `.env` (repo root) — push to Vercel

```env
SWARM_INGEST_URL=https://symbiomarket.vercel.app/api/swarm/ingest
SWARM_INGEST_SECRET=same-secret-as-vercel
SWARM_PUSH_EVERY=6
```

---

## 5. Run swarm (streams to Vercel)

```bash
# WSL
cd /mnt/c/Users/dell/cursor-symbio/Symbiomarket
source venv/bin/activate
python3 agents/swarm_api.py
```

You should see: `[ok] Cycle 6 -> swarm updated + pushed to Vercel (every 6 cycles)` and `[push] ok (kv)`.

After FHE/Arc sync, push FHE state too:

```powershell
python agents/push_swarm_state.py
```

---

## 6. Verify

- https://YOUR_APP.vercel.app/swarm — live cycles updating
- https://YOUR_APP.vercel.app/api/swarm/meta — `{ "source": "kv", "ingestEnabled": true }`

---

## Local dev (unchanged)

Without `SWARM_INGEST_*`, `swarm_api.py` only writes `swarm_data.json`; Next.js reads local files when KV is not set.

---

## README

Add deployed URL under **Live App** in root `README.md` after first deploy.
