# Lepton hackathon form — paste-ready answers

Fill personal fields (email, Discord, Telegram) yourself. Everything else is ready to copy.

**Live:** https://arc-nanopayments-dun.vercel.app  
**Repo:** https://github.com/JoshHellix/Symbiomarket  
**Video:** _(add your Loom / YouTube link before submit)_

---

## Personal fields (you fill in)

| Field | Suggested value |
|-------|-----------------|
| Email | _your email_ |
| Project Name | **SymbioMarket** |
| Github Handle | **JoshHellix** (https://github.com/JoshHellix/Symbiomarket) |
| Discord Handle | _your Discord_ |
| Telegram Handle | _your Telegram_ |
| Twitter / X Profile | **https://x.com/SymbioMarket** |
| Number of Team Members | **1 (Solo)** |
| Team Members Names | **Ikoro Joshua Klau** |

---

## Problem Statement

Creators who publish on the open web — articles, newsletters, photos, music, and video — cannot charge per piece. Payment rails force subscriptions ($10/month minimum), so a single read, listen, or citation is worth $0 to the author.

At the same time, AI agents are becoming the biggest consumers of that content. They have no wallet, no budget rules, and no standard way to pay the person whose URL they cite.

Arc and Circle prove that sub-cent USDC settlements work on-chain. What's missing is the **books**: a creator registry, citation paywalls, revenue splits, and autonomous clients that actually spend — not simulated dashboard rows.

SymbioMarket solves the gap between **agent consumption** and **creator compensation** on Arc.

---

## Project Description

**SymbioMarket** is pay-per-piece creator settlement on Arc — built for Lepton RFB #6 (creator micropayments), with a four-agent swarm as the live demo client (RFB #1).

### What it does

- **Creators** register a feed URL and Arc wallet at `/register`. When any client cites their URL, x402 unlocks attribution and routes USDC to them.
- **Four agents** (Oracle → Strategist → Executor → Evaluator) run a budget-aware loop each cycle: read live market data, decide pay vs hold, cite registered creators, and adjust risk from outcomes.
- **Other builders** register agent operators at `/register-agent` and reuse the same settlement APIs without forking Circle's template from scratch.

### How it works

1. **Frontend (Vercel):** Next.js 16 app — marketing site, creator/agent registries, live swarm dashboard at `/swarm`, operator treasury at `/dashboard`.
2. **Backend (Next.js API routes):** x402-protected premium routes (quote, dataset, citation, agent-task), settlement CRUD APIs, swarm state ingest.
3. **Database (Supabase):** `symbio_creators`, `symbio_agents`, remote swarm state, payment events.
4. **Agent swarm (Python, local):** `swarm_api.py` builds a depth-4 payment mesh per cycle, executes live x402 via Circle Gateway (`pay-mesh.mts`), pushes state to Vercel ingest.

**Citation flow (RFB #6 core):** Executor calls `GET /api/premium/citation?source=<registered-feed-url>` → HTTP 402 → Circle Gateway signs USDC on Arc testnet → creator wallet credited per `splitBps`.

### Tech stack

- **Arc testnet** + USDC + [Arcscan](https://testnet.arcscan.app)
- **Circle Gateway** + **x402** (`@circle-fin/x402-batching`, `@x402/core`)
- **Next.js 16**, React 19, Tailwind 4, Supabase Postgres
- **Python** swarm — CoinGecko market feed, optional DeepSeek LLM oracle
- **viem** for wallet funding scripts
- Optional: **Zama FHE** companion repo (`symbio-arc-privacy/`) for confidential fleet totals

### Lepton build progress (returning builder note)

Compared to our prior Agora submission:

- **Connected live dashboard** — swarm pushes to `/api/swarm/ingest`; public URL no longer stale vs localhost.
- **Real USDC** on Arc testnet via live x402 mesh (not simulated payment rows).
- **Creator registry** with 5+ real signups (Medium, X, YouTube feeds), duplicate URL guard, public `/creators` page.
- **Agent operator registry** at `/register-agent` and `/agents`.
- **Live market oracle** (CoinGecko) + LLM oracle path (DeepSeek).
- **Strategist budget gate** — skips expensive routes when confidence or session budget is low.

### Important: swarm availability

The **web app and registries are always online** on Vercel. The **Python agent swarm runs on the founder's machine** during demos — it is **not always active**. When offline, `/swarm` shows the last synced state; live payment ticks resume when the swarm process is restarted.

---

## Traction

**Creators (RFB #6 — primary metric):**
- **5+ real creator registrations** in Supabase — public feeds (Medium articles, X posts, YouTube channels) with Arc testnet wallets
- Open registration at https://arc-nanopayments-dun.vercel.app/register — no gate, persists across deploys
- Duplicate feed URL protection + public listing at `/creators`

**Live payments:**
- **300+ swarm cycles** executed with structured payment mesh
- **Live x402 USDC settlements** on Arc testnet when swarm + seller are running (Circle Gateway)
- Homepage live settlement feed + `/swarm` nanopayment ticker

**Developers / validation:**
- Public settlement APIs documented in README (`/api/settlement/creators`, `/api/settlement/agents`)
- Agent operator registry live — third parties can list citation-paying clients
- Deployed production URL on Vercel (not localhost-only demo)

**Social / community:** _(add your numbers before submit)_
- X: @SymbioMarket — _N followers, N posts during Lepton_
- Lepton Discord feedback and creator signup posts
- GitHub: public repo at JoshHellix/Symbiomarket

**Arc on-chain proof:** Payer wallet activity on Arc testnet explorer (live x402 cycles). Gateway settlement refs are UUIDs; Arcscan links use payer wallet addresses.

---

## Project Source Code

https://github.com/JoshHellix/Symbiomarket

Public repo. Monorepo: `arc-nanopayments/` (Next.js + Supabase), `agents/` (Python swarm), `settlement/` (docs), `symbio-arc-privacy/` (optional FHE companion).

---

## Project Live

https://arc-nanopayments-dun.vercel.app

Key pages:
- https://arc-nanopayments-dun.vercel.app/swarm — agent dashboard
- https://arc-nanopayments-dun.vercel.app/register — creator signup
- https://arc-nanopayments-dun.vercel.app/creators — public registry
- https://arc-nanopayments-dun.vercel.app/register-agent — agent operator signup

---

## Project Video Demo

_(paste your Loom / YouTube / Vimeo URL — max 3 minutes)_

Suggested flow: problem (10s) → register creator (20s) → `/swarm` four agents + live feed (60s) → Arc payer proof (20s) → open registries for builders (30s) → close (10s).

---

## (Arc OSS) Why choose SymbioMarket?

SymbioMarket exposes **reusable Arc payment primitives** that Circle's demo templates don't include:

1. **Creator registry API + UI** — register feeds, wallets, revenue splits; duplicate URL normalization
2. **Citation toll (x402)** — `?source=` URL matching → pay-per-piece unlock → creator payout
3. **Agent operator registry** — discover who runs citation-paying clients
4. **Structured agent payment mesh** — map agent roles to priced x402 routes (reference pattern for any multi-agent app)
5. **Swarm ingest pattern** — sync local agent state to a hosted dashboard (Supabase / KV)
6. **Full-stack reference** — Next.js seller + Python buyer + Supabase persistence

Other builders can fork the settlement layer, swap in their own agent, and keep Arc + x402 plumbing. Companion FHE kit in `symbio-arc-privacy/` for confidential aggregate spend (Sepolia) + Arc USDC settlement.

**Yes — I commit to keeping the codebase open source.**

---

## Circle / Arc Feedback

**What worked well:**
- **Arc testnet + USDC** — sub-cent payments are credible; Arcscan gives judges on-chain proof.
- **Circle Gateway + x402 batching** — gasless buyer flow; `GatewayClient` in Node and pay-mesh script is practical for agent clients.
- **Circle nanopayments demo template** — strong starting point for seller middleware and dashboard patterns.
- **Faucet** — easy to fund test wallets for live demo cycles.

**Where Arc / Circle can improve:**
- **Explorer clarity for Gateway settlements** — Gateway returns UUID settlement refs, not always an Arcscan tx hash; document which link to show judges (payer wallet / USDC transfer tx vs gateway ref).
- **Hosted x402 seller guide** — running the seller on Vercel with live agent on a dev machine requires clear `X402_BASE_URL` + cold-start docs (we use local `npm run start` for fast x402 response).
- **Agent buyer examples in Python** — JS `GatewayClient` is well documented; a first-class Python buyer SDK would help swarm-style projects.
- **Arc OSS showcase onboarding** — clearer checklist tying RFB categories to repo structure (creator registry vs agent demo).

---

## General Feedback (Canteen / Lepton)

**What worked well:**
- RFB list gave a clear product wedge (RFB #6 creator micropayments vs generic agent demo).
- Returning builder track motivated showing **delta from Agora** (connected URL, live USDC, creator signups).
- Discord + office hours for Arc stack questions.

**What could improve:**
- Earlier emphasis on **traction metrics** (creator signups vs payment count) in week 1.
- Sample submission README template for **monorepo** projects (frontend + Python agents + Supabase).
- Clearer guidance on **what must be 24/7** vs acceptable local-only agent processes for judging.

---

## Quick checklist before submit

- [ ] Video link uploaded (≤ 3 min, subtitles if needed)
- [ ] Discord + Telegram + email filled in
- [ ] Traction numbers updated (X followers, exact creator count)
- [ ] Arc OSS checkbox if applying
- [ ] Confirm repo is public and Vercel URL loads
