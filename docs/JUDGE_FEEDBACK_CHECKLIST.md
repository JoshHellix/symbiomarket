# Judge feedback → action checklist

**Lepton deadline:** Jun 29, 2026  
**Live demo:** https://arc-nanopayments-dun.vercel.app/swarm  
**Creator signup:** https://arc-nanopayments-dun.vercel.app/register  

---

## Context (your Agora note — use in Discord if asked)

Judges scored **Vercel dashboard only**, which was **not connected** to your real localhost swarm at submit time. Your **video showed the real swarm**; the public URL showed stale/simulated JSON.  

**Lepton fix:** Supabase push from `swarm_api.py` — dashboard now mirrors the engine. Say this explicitly in submission: *“Agora URL was disconnected; Lepton URL is live-fed.”*

---

## Scorecard: praise → what we did

| Judge praise | Action taken | Your todo |
|--------------|--------------|-----------|
| Prior work (Bet-Swarm, Stellar x402, Zama template) | Mention in README + video intro | Add 1 sentence + links |
| FHE adds depth | `symbio-arc-privacy/` standalone repo scaffolded | **Publish repo** + fill [Showcase form](https://forms.gle/LDCYyqT8ayp8Tp3Y6) |
| Standalone repo for Arc privacy | `symbio-arc-privacy/README.md`, `PUBLISH.md` | `git push` to `JoshHellix/symbio-arc-privacy` |
| Excited about FHE | Dual-layer docs (Sepolia FHE + Arc settle) | 20s in video, link companion repo |

---

## Scorecard: criticism → what we did

| Judge criticism | Was true? | Fix in repo | Still todo |
|-----------------|-----------|-------------|------------|
| Random market | Yes | `agents/market_feed.py` — CoinGecko live BTC/ETH | Run swarm online |
| 3/4 agents hardcoded | Yes | Strategist = budget + priority; Oracle = LLM in `oracle_llm.py` | Set `DEEPSEEK_API_KEY` in `.env` |
| Oracle not LLM in prod loop | Yes | `swarm_api.py` now `await oracle_act()` | Restart `swarm_api.py` |
| Shallow Circle integration | Partially | live x402 mesh + settlement API | Fund buyer + `npm run dev` or cloud BASE_URL |
| Vercel looked fake | Yes (Agora) | Supabase ingest | Keep Terminal 4 running |
| Need traction | Yes | `/register` page + Supabase `symbio_creators` | Get 3 real signups |

---

## RFB 1 vs RFB 6 — our pick

**Lead RFB 6 (creator micropayments). Use RFB 1 as the demo client.**

| | RFB 6 — product | RFB 1 — demo |
|--|-----------------|--------------|
| Who pays | Agents (autonomous) | Same |
| Who earns | **Registered creators** | — |
| Traction metric | **Creator signups** | Payment count |
| Pitch | “Stripe for per-use creator payouts on Arc” | “Four agents are our first customers” |

**Traction sprint (judges weighted this):**

- [ ] Post signup link: `/register` on X + Lepton Discord
- [ ] **3 real creators** (name, feed URL, Arc wallet)
- [ ] **2 external testers** (they register or you register for them)
- [ ] **200+ Arc USDC txs** in event window (`fund-buyer` + live x402)
- [ ] README: table of creator names + Arc tx links

---

## Standalone FHE repo (`symbio-arc-privacy`)

Judges asked for this **explicitly** for [Arc Open Source Showcase](https://forms.gle/LDCYyqT8ayp8Tp3Y6).

- [ ] Run SQL for creators table in Supabase (see `supabase/migrations/20260311000000_symbio_creators.sql`)
- [ ] `cd symbio-arc-privacy && npm install`
- [ ] Publish per `symbio-arc-privacy/PUBLISH.md`
- [ ] Fill showcase form — list repo + SymbioMarket as reference app
- [ ] Link from main README: “Companion: confidential settlement kit”

**Arc-native FHE?** No (Zama = Sepolia). Honest pitch: **confidential totals off Arc, USDC settlement on Arc.**

---

## Live payments checklist

- [ ] `npm run fund-buyer` in `arc-nanopayments`
- [ ] `npm run dev` in `arc-nanopayments` (or `BASE_URL` = Vercel URL in `.env.local`)
- [ ] `LIVE_X402=1` in repo `.env`
- [ ] `SETTLEMENT_API_URL=https://arc-nanopayments-dun.vercel.app` in repo `.env`
- [ ] `DEEPSEEK_API_KEY=...` for LLM oracle (optional but answers judge criticism)
- [ ] `python agents/swarm_api.py`
- [ ] Verify: `https://arc-nanopayments-dun.vercel.app/api/swarm/state` → `oracle_mode: llm`, payments `mode: live`

---

## Submission pack

- [ ] Video &lt; 3 min: Arc tx first → agents pay creators → `/register` → fork `symbio-arc-privacy`
- [ ] README: Agora vs Lepton delta (connected URL, live USDC, creator registry)
- [ ] 5–10 Arcscan links
- [ ] Paste copy from `docs/PASTE_ABOUT_SYMBIOMARKET.md`
- [ ] Lepton form submit before Jun 29

---

## Files changed in this sprint

| Area | Path |
|------|------|
| Standalone privacy repo | `symbio-arc-privacy/` |
| Live market feed | `agents/market_feed.py` |
| LLM oracle | `agents/oracle_llm.py` |
| Creator fetch for mesh | `agents/creator_registry.py` |
| Upgraded swarm loop | `agents/swarm_api.py` |
| Creator persistence | `supabase/migrations/20260311000000_symbio_creators.sql` |
| Register page (RFB 6) | `arc-nanopayments/app/register/page.tsx` |
| Chart trades fix | `arc-nanopayments/lib/map-swarm-to-dashboard.ts` |

---

## Quick commands

```powershell
# Swarm (upgraded)
cd agents
python swarm_api.py

# Publish privacy repo (once)
cd symbio-arc-privacy
# follow PUBLISH.md

# Supabase: run creators migration in SQL Editor
# Then redeploy Vercel
```
