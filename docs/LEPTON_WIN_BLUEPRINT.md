# Lepton win blueprint

**Goal:** 1st place. Agent project on settlement infrastructure.

**Dates:** Jun 15 – Jun 29, 2026 · [Lepton](https://lepton.thecanteenapp.com/)

**Plain pitch:** See [`WHAT_IS_SYMBIOMARKET.md`](WHAT_IS_SYMBIOMARKET.md)

---

## Judging alignment

| Weight | What we show |
|--------|----------------|
| 30% Agency | Pay / skip / route / split / evaluate ROI — four distinct decisions per cycle |
| 30% Traction | 200+ real Arc USDC txs; external creators registered; judges click live URL |
| 20% Circle | Gateway + x402 + wallets on every hop |
| 20% Innovation | Payment mesh + creator splits + confidential fleet totals (FHE) |

---

## Architecture

```
Settlement layer (other builders use this)
  ├── Creator registry API
  ├── x402 routes (citation, quote, dataset, …)
  └── Treasury / mesh indexer

Agent layer (what the video shows)
  ├── Oracle    → pays data feeds
  ├── Strategist → routing / budget choice
  ├── Executor  → pays creators (splits)
  └── Evaluator → scores spend efficiency
```

---

## Phases

### Phase 1 — Foundation (now)

- [x] Plain-English docs + win-only project rule
- [ ] Creator registry + types
- [ ] Citation x402 endpoint with split metadata
- [ ] Swarm emits structured payment intents per agent role
- [ ] `settlement/README.md` for external builders

### Phase 2 — Real money

- [x] `.env.local` + distinct seller/buyer wallets
- [x] x402 `maxTimeoutSeconds: 604900` fix
- [x] `npm run pay-once` — 5 real USDC micropayments locally
- [x] Wire swarm mesh → live buyer agent each cycle (`LIVE_X402=1`, `agents/live_x402.py`)
- [x] Mesh recorded with gateway settlement ids
- [ ] Supabase payment_events sync (optional dashboard Payments tab)

### Phase 3 — Treasury surface

- [ ] Dashboard: payment graph, creator ledger, chain depth
- [ ] Public metrics block for README (tx count, avg size)

### Phase 4 — Moat + ship

- [ ] FHE fleet spend total (existing pipeline)
- [ ] <3 min video script
- [ ] Early + final form submit
- [ ] Discord / X traction sprint

---

## Win metrics (targets)

| Metric | Target |
|--------|--------|
| On-chain USDC payments (event window) | 200+ |
| Average payment size | sub-cent |
| Payment chain depth | ≥ 3 hops agent→agent or agent→creator |
| External creator registrations | ≥ 3 |
| Live URL | https://symbiomarket.vercel.app |

---

## Video beats (under 3 min)

1. **10s** — Problem: subscriptions vs per-use; agents with no wallet
2. **20s** — Live cycle: four agents, four decisions
3. **40s** — Real Arc payment + creator split
4. **30s** — Treasury dashboard + tx links
5. **20s** — Settlement API: other builders register a feed
6. **10s** — Close: agent project + open infra for Arc ecosystem
