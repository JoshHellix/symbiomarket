# SymbioMarket — next steps

**Master checklist (judge feedback + Lepton win):** [`JUDGE_FEEDBACK_CHECKLIST.md`](./JUDGE_FEEDBACK_CHECKLIST.md)

---

## Live demo (already working)

- **Public URL:** https://arc-nanopayments-dun.vercel.app/swarm
- **Swarm engine:** `python agents/swarm_api.py` (Terminal 4)
- **Remote state:** Supabase (pushes every 6 cycles via `SWARM_PUSH_EVERY=6`)
- **Ingest URL in `.env`:** `https://arc-nanopayments-dun.vercel.app/api/swarm/ingest`

---

## To do before Lepton submission

### Payments & demo

- [ ] **Fund buyer wallet** — `cd arc-nanopayments && npm run fund-buyer` (Terminal 4 showed `transfer amount exceeds balance`)
- [ ] **Run local x402 seller** — `cd arc-nanopayments && npm run dev` (see x402 note below)
- [ ] Restart `python agents/swarm_api.py` with `LIVE_X402=1` in repo `.env`
- [ ] Confirm feed shows **confirmed** rows + Arc explorer links on Vercel `/swarm`
- [ ] **Fix chart trades = 0** — UI looks for `TX-000012` IDs but mesh uses `MESH-000012-ORA` (`lib/map-swarm-to-dashboard.ts`)

### Vercel / domains

- [ ] Re-attach **`symbiomarket.vercel.app`** to current project (Settings → Domains) or keep using `arc-nanopayments-dun.vercel.app` everywhere
- [ ] Update README + submission form with final live URL

### FHE (optional moat, scroll-down panel)

- [ ] Refresh stale FHE data: `cd fhe-contracts && npm run sync:swarm`
- [ ] Next swarm push (cycle 6, 12, …) will upload new `fhe_sync_state.json` to Supabase
- [ ] Panel reads `/api/fhe/state` — same project, not a separate app

### Lepton submission pack

- [ ] **3‑min video** — swarm cycles + real USDC tx on Arc + settlement story
- [ ] README Lepton pitch (agents + infrastructure for other builders)
- [ ] Paste-ready copy in `docs/PASTE_ABOUT_SYMBIOMARKET.md`
- [ ] Arc tx links in README for proof (not simulated-only)

### Nice-to-have

- [ ] **x402 without localhost** — set `BASE_URL=https://arc-nanopayments-dun.vercel.app` in `arc-nanopayments/.env.local` and ensure seller keys work on Vercel (advanced; localhost is simpler today)
- [ ] Terminal 1 `sonner` error — always start dev from `arc-nanopayments` folder, not repo root
- [ ] Creator registry with real creator wallets (settlement layer story)

---

## x402 + localhost — how it works

**With current config: yes — you need `npm run dev` on localhost:3000 for real x402 payments.**

Flow:

```
python swarm_api.py
  → live_x402.py calls npm run pay-mesh
  → pay-mesh hits BASE_URL + /api/premium/quote (etc.)
  → BASE_URL in .env.local = http://localhost:3000
  → Next.js app = x402 **seller** (paywall)
  → Buyer wallet pays in real USDC on Arc
  → Results merged into swarm_data.json → pushed to Vercel
```

**What works without localhost:**

| Feature | Needs localhost? |
|---------|------------------|
| Swarm cycles, agents, market on Vercel | No — only `swarm_api.py` + push |
| Simulated payment rows in feed | No |
| **Live x402 USDC** | **Yes** (today) — seller is local Next.js |
| FHE panel on Vercel | No for *display*; sync script runs separately on your PC |
| Vercel `/swarm` dashboard updates | No — Supabase ingest from laptop |

**Alternative (later):** Point `BASE_URL` at your Vercel URL so the seller lives in the cloud. Requires seller wallet env vars on Vercel and x402 routes working in production. Localhost is the path of least resistance for the hackathon demo.

---

## Quick command reference

```powershell
# Terminal 1 — x402 seller (required for live USDC)
cd c:\Users\dell\cursor-symbio\Symbiomarket\arc-nanopayments
npm run dev

# Terminal 2 — swarm + push
cd c:\Users\dell\cursor-symbio\Symbiomarket\agents
python swarm_api.py

# One-off fund buyer
cd c:\Users\dell\cursor-symbio\Symbiomarket\arc-nanopayments
npm run fund-buyer

# One-off FHE refresh
cd c:\Users\dell\cursor-symbio\Symbiomarket\fhe-contracts
npm run sync:swarm

# Test push
cd c:\Users\dell\cursor-symbio\Symbiomarket
python agents/push_swarm_state.py
```
