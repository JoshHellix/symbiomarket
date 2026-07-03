# SymbioMarket

**Get paid when AI and agents cite your content** — per article, photo, song, or video — in sub-cent USDC on [Arc](https://arc.circle.com/).

Built for **Lepton** (Canteen × Circle). SymbioMarket is both a **live agent demo** and **open settlement infrastructure**: creator registry, agent operator registry, x402 paywalls, and a treasury dashboard other builders can fork.

| | URL |
|---|-----|
| **Live app** | https://arc-nanopayments-dun.vercel.app |
| **Swarm demo** | [/swarm](https://arc-nanopayments-dun.vercel.app/swarm) |
| **Register creator** | [/register](https://arc-nanopayments-dun.vercel.app/register) |
| **Creator registry** | [/creators](https://arc-nanopayments-dun.vercel.app/creators) |
| **Register agent** | [/register-agent](https://arc-nanopayments-dun.vercel.app/register-agent) |
| **Agent registry** | [/agents](https://arc-nanopayments-dun.vercel.app/agents) |
| **GitHub** | https://github.com/JoshHellix/Symbiomarket |

> **Note for judges:** The **web app and registries run 24/7 on Vercel + Supabase**. The **Python agent swarm runs on the founder's machine** during demos and hackathon windows — it is **not always online**. When the swarm is stopped, `/swarm` shows the last synced state; live USDC ticks resume when `swarm_api.py` is running again. See [Live vs offline](#live-vs-offline).

---

## The problem

1. **Creators** cannot charge $0.01 per article or clip — card fees force $10/month subscriptions (Lepton **RFB #6**).
2. **AI agents** consume content and data but have no wallet, no budget discipline, and no way to pay registered creators.
3. **Arc** proves sub-cent USDC works — but someone still needs **registries, paywalls, splits, and a treasury view**.

SymbioMarket connects all three: autonomous agents spend small USDC amounts; **registered creators** earn when their URL is cited; everything clears on Arc via **Circle Gateway + x402**.

---

## What it does

### For creators
1. Open **[/register](https://arc-nanopayments-dun.vercel.app/register)** — add feed URL + Arc testnet wallet + revenue split.
2. When an agent or app calls `GET /api/premium/citation?source=<your-url>`, x402 unlocks attribution and routes **$0.001 USDC** (today) to your wallet.
3. Public listing at **[/creators](https://arc-nanopayments-dun.vercel.app/creators)**.

### For agent builders
1. Register your operator at **[/register-agent](https://arc-nanopayments-dun.vercel.app/register-agent)** — name, endpoint, Arc wallet.
2. Point your citation-paying client at the same x402 routes and creator registry API.
3. Listed at **[/agents](https://arc-nanopayments-dun.vercel.app/agents)**.

### For developers (settlement layer)
Reusable primitives — no need to rebuild Circle's nanopayments template from scratch:

```http
GET  /api/settlement/creators          # public creator registry
POST /api/settlement/creators          # register a feed (duplicate URL guard)
GET  /api/settlement/agents            # public agent operator registry
POST /api/settlement/agents            # register an operator
GET  /api/premium/citation?source=URL  # x402 citation toll (RFB #6 core)
GET  /api/premium/quote                # x402 oracle intel ($0.001)
GET  /api/premium/dataset              # x402 routing data ($0.01)
GET  /api/premium/agent-task           # x402 spend review ($0.001)
GET  /api/swarm/state                  # live swarm JSON for dashboard
```

See [`settlement/README.md`](settlement/README.md) and [`arc-nanopayments/README.md`](arc-nanopayments/README.md) for setup.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Vercel — Next.js 16 (arc-nanopayments/)                        │
│  Marketing · /register · /creators · /agents · /swarm dashboard │
│  x402 seller routes · settlement APIs · operator /dashboard     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Supabase (Postgres)
                            │ symbio_creators · symbio_agents
                            │ symbio_remote_state · payment_events
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Local — Python swarm (agents/swarm_api.py)  [NOT 24/7]         │
│  Oracle → Strategist → Executor → Evaluator                     │
│  CoinGecko market · DeepSeek oracle (optional) · live x402 mesh │
│  Pushes state → POST /api/swarm/ingest every N cycles           │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Circle Gateway + USDC on Arc testnet
                            ▼
                    Registered creator wallets
```

Each swarm **cycle** builds a **depth-4 payment mesh** — one x402 intent per agent role. The **Executor** cites a **registered creator URL** from Supabase and pays via `/api/premium/citation`.

---

## The four agents

| Agent | Job | x402 route | Typical price |
|-------|-----|------------|---------------|
| **Oracle** | Reads live BTC/ETH (CoinGecko) + optional LLM signal | `/api/premium/quote` | $0.001 |
| **Strategist** | Budget gate — pay vs **hold** on confidence & volatility | `/api/premium/dataset` | $0.01 (skipped on hold) |
| **Executor** | Pays **registered creators** when citing their feed URL | `/api/premium/citation?source=…` | $0.001 |
| **Evaluator** | Learning loop — adjusts risk/bias from cycle PnL | `/api/premium/agent-task` | $0.001 |

**Agents are the demo. The registries and x402 routes are the product.**

---

## How this helps Arc

- **Many sub-cent USDC payments** per cycle — not one big demo transfer.
- **Agents as economic actors** with real wallets and session budgets on Arc testnet.
- **Creator economy** — payees earn per citation, with `splitBps` revenue sharing.
- **Circle stack end-to-end** — Gateway batching, x402 HTTP 402, USDC, Arcscan proofs (payer wallet / on-chain txs where available).
- **Reference story for Arc OSS** — forkable creator registry + citation toll + swarm client.

Optional companion: [`symbio-arc-privacy/`](symbio-arc-privacy/) — Zama FHE confidential fleet totals on Sepolia, Arc USDC settlement on-chain (dual-layer privacy demo).

---

## Judge feedback → what we built (Lepton delta)

Prior submission (Agora) had a **disconnected Vercel dashboard** while the real swarm ran on localhost. Judges also flagged **random markets**, **hardcoded agents**, and **shallow Circle integration**.

| Feedback | Lepton fix |
|----------|------------|
| Dashboard not live-fed | `swarm_api.py` pushes to **`/api/swarm/ingest`** → Supabase / KV; `/swarm` mirrors the engine |
| Random market data | **`agents/market_feed.py`** — live CoinGecko BTC/ETH |
| Oracle not LLM-driven | **`agents/oracle_llm.py`** — DeepSeek when `DEEPSEEK_API_KEY` set; rules fallback |
| Agents felt hardcoded | **Strategist** = session budget + confidence gate; **Evaluator** = adaptive memory |
| Need creator traction (RFB #6) | **`/register`**, **`symbio_creators`** table, duplicate URL guard, 5+ real creator signups |
| Circle integration shallow | **Live x402 mesh** via `pay-mesh.mts` + Circle `GatewayClient` on Arc testnet |
| Standalone privacy repo | **`symbio-arc-privacy/`** scaffold for Arc OSS showcase |

More detail: [`docs/JUDGE_FEEDBACK_CHECKLIST.md`](docs/JUDGE_FEEDBACK_CHECKLIST.md) · [`docs/WHAT_IS_SYMBIOMARKET.md`](docs/WHAT_IS_SYMBIOMARKET.md)

---

## Stack

| Layer | Tech | Location |
|-------|------|----------|
| **Frontend** | Next.js 16, React 19, Tailwind 4, shadcn/ui | `arc-nanopayments/` |
| **Backend / APIs** | App Router route handlers, x402 middleware | `arc-nanopayments/app/api/` |
| **Database** | Supabase Postgres + RLS | `arc-nanopayments/supabase/migrations/` |
| **Payments** | Circle Gateway, `@circle-fin/x402-batching`, `@x402/core`, viem, Arc USDC | `lib/x402.ts`, `scripts/pay-mesh.mts` |
| **Agent swarm** | Python 3, asyncio, LangChain DeepSeek (optional) | `agents/` |
| **Remote state** | Swarm ingest → Supabase / Upstash | `app/api/swarm/ingest/` |
| **Deploy** | Vercel (app), local (swarm) | `vercel.json` |

### Database tables (Supabase)

| Table | Purpose |
|-------|---------|
| `symbio_creators` | Creator registry — feed URL, wallet, split_bps |
| `symbio_agents` | Agent operator registry — endpoint, operator wallet |
| `symbio_remote_state` | Latest swarm JSON from ingest |
| `payment_events` | x402 settlement log (operator dashboard) |
| `transactions` / withdrawals | Circle template treasury tables |

Migrations: `arc-nanopayments/supabase/migrations/`

---

## Live vs offline

| Component | Always on? | Notes |
|-----------|------------|-------|
| Vercel app (home, register, creators, agents) | **Yes** | Public URLs work without the swarm |
| Supabase registries | **Yes** | Creator/agent signups persist |
| `/swarm` dashboard | **Partial** | Shows **last ingested state**; stale if swarm stopped |
| Live USDC payment ticks | **No** | Requires local `swarm_api.py` + funded buyer wallet + x402 seller (`npm run start` locally or configured `X402_BASE_URL`) |
| Operator `/dashboard` | **Yes** | Login-gated; shows Supabase payment history when events recorded |

**To run live payments locally:**

```powershell
# Terminal 1 — x402 seller (use prod start, not dev, for fast x402)
cd arc-nanopayments
npm install
npm run build && npm run start   # http://localhost:3000

# Terminal 2 — agent swarm
cd agents
# Set in repo .env: LIVE_X402=1, X402_BASE_URL=http://localhost:3000,
#   SWARM_INGEST_URL=https://arc-nanopayments-dun.vercel.app/api/swarm/ingest
py -u swarm_api.py
```

Fund buyer: `npm run fund-buyer` in `arc-nanopayments` (Circle faucet → Arc testnet USDC).

---

## Repo layout

```
Symbiomarket/
├── arc-nanopayments/     # Next.js app — frontend, APIs, Supabase, x402 seller
├── agents/               # Python swarm — Oracle/Strategist/Executor/Evaluator
├── settlement/           # Settlement layer docs
├── symbio-arc-privacy/   # Optional FHE companion (Sepolia + Arc dual-layer)
├── docs/                 # Judge checklist, video script, submission copy
└── fhe-contracts/        # Legacy Hardhat FHE experiments
```

---

## Arc OSS — primitives for other builders

Compared to Circle's `arc-nanopayments-demo` template, SymbioMarket adds:

1. **Creator registry API** + UI with duplicate feed URL normalization
2. **Citation toll** — pay-per-piece unlock tied to `?source=` URL matching
3. **Agent operator registry** — discover who runs citation clients
4. **Four-role payment mesh** — structured agent → x402 route mapping
5. **Live swarm ingest** — pattern for syncing local agent state to Vercel
6. **Revenue splits** — `splitBps` on creator records

Fork this repo, swap the swarm for your own agent, keep the settlement layer.

---

## Author

**Ikoro Joshua Klau** — Founder & Lead Developer · Nigeria  
X: [@SymbioMarket](https://x.com/SymbioMarket) · GitHub: [JoshHellix](https://github.com/JoshHellix)

Built for Lepton hackathon. Prior Arc work: Bet-Swarm, Stellar x402 experiments, Zama FHE template.

---

## Docs

- [`docs/LEPTON_SUBMISSION.md`](docs/LEPTON_SUBMISSION.md) — hackathon form copy (paste-ready)
- [`docs/WHAT_IS_SYMBIOMARKET.md`](docs/WHAT_IS_SYMBIOMARKET.md) — plain-English explainer
- [`docs/JUDGE_FEEDBACK_CHECKLIST.md`](docs/JUDGE_FEEDBACK_CHECKLIST.md) — Agora → Lepton fixes
- [`arc-nanopayments/README.md`](arc-nanopayments/README.md) — dev setup, env vars, endpoints

**License:** Apache-2.0 (Circle template components) · Open source for Arc OSS showcase.
