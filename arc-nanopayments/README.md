# SymbioMarket — Arc Nanopayments App

Next.js frontend, x402 seller APIs, Supabase database, and operator dashboard for **SymbioMarket** — pay-per-piece creator settlement on Arc.

Part of the [SymbioMarket monorepo](https://github.com/JoshHellix/Symbiomarket). See the [root README](../README.md) for the full project story, judge checklist, and agent swarm docs.

**Live:** https://arc-nanopayments-dun.vercel.app

> The **Python agent swarm** (`../agents/swarm_api.py`) runs on the operator's machine and is **not always online**. This Vercel app and Supabase registries **are** always available. Live USDC ticks on `/swarm` require the swarm process to be running and pushing to `/api/swarm/ingest`.

---

## What this app includes

| Area | Routes / paths |
|------|----------------|
| **Marketing** | `/` — hero, RFB #6 use cases, live settlement ticker |
| **Creator registry** | `/register`, `/creators`, `GET/POST /api/settlement/creators` |
| **Agent registry** | `/register-agent`, `/agents`, `GET/POST /api/settlement/agents` |
| **Swarm dashboard** | `/swarm` — neon agent UI, live payment feed |
| **Operator treasury** | `/dashboard` — x402 payment log, Gateway balance, withdrawals |
| **x402 seller** | `/api/premium/*` — quote, dataset, citation, compute, agent-task |
| **Swarm sync** | `GET /api/swarm/state`, `POST /api/swarm/ingest` |

---

## Paywalled endpoints (x402 on Arc)

| Endpoint | Method | Price (USDC) | Role in swarm |
| --- | --- | --- | --- |
| `/api/premium/quote` | GET | $0.001 | Oracle — market intel |
| `/api/premium/dataset` | GET | $0.01 | Strategist — routing data |
| `/api/premium/citation?source=URL` | GET | $0.001 | **Executor — creator citation (RFB #6)** |
| `/api/premium/agent-task` | GET | $0.001 | Evaluator — spend review |
| `/api/premium/compute` | POST | $0.0003 | Optional text analysis |

Unpaid requests return **402 Payment Required**. Buyers use Circle Gateway (`GatewayClient` or `npm run pay-mesh`).

---

## Database (Supabase)

Migrations in `supabase/migrations/`:

| Migration | Table | Purpose |
|-----------|-------|---------|
| `20260310000000_create_transactions.sql` | payments, withdrawals | Circle template treasury |
| `20260310000001_enable_realtime.sql` | — | Realtime subscriptions |
| `20260310000002_symbio_remote_state.sql` | swarm state blob | Ingest from Python swarm |
| `20260311000000_symbio_creators.sql` | `symbio_creators` | Creator registry |
| `20260312000000_symbio_agents.sql` | `symbio_agents` | Agent operator registry |
| `20260313000000_symbio_creators_unique_feed.sql` | unique index | Duplicate feed URL guard |

Apply locally or via Supabase CLI:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

---

## Prerequisites

- **Node.js v22+**
- **Supabase** project (cloud or local Docker)
- **Arc testnet wallets** — seller + buyer (see below)
- *(Optional)* **DeepSeek / OpenAI** — for LLM agents (swarm uses DeepSeek in repo `.env`)

---

## Getting started

1. **Install dependencies**

   ```bash
   cd arc-nanopayments
   npm install
   ```

2. **Environment**

   ```bash
   cp .env.example .env.local
   ```

   Fill Supabase keys, seller/buyer wallets. Run `npm run generate-wallets` if needed.

3. **Database** — push migrations (see above).

4. **Start seller** (x402 routes)

   For live agent payments, prefer production start (faster x402 than dev mode):

   ```bash
   npm run build && npm run start
   ```

   Dev mode works for UI work:

   ```bash
   npm run dev
   ```

5. **Fund buyer wallet**

   ```bash
   npm run fund-buyer
   ```

   Fund via [Circle faucet](https://faucet.circle.com/) first if needed.

6. **Run agent swarm** (separate terminal, repo root)

   ```powershell
   cd ../agents
   # repo .env: LIVE_X402=1, X402_BASE_URL=http://localhost:3000
   py -u swarm_api.py
   ```

7. **Verify**

   - http://localhost:3000/swarm — cycles incrementing
   - http://localhost:3000/api/swarm/state — `settlement.mode: live`
   - Live feed on homepage updates when ingest URL points to Vercel

---

## Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Registry writes, payment events |
| `SELLER_ADDRESS` / `SELLER_PRIVATE_KEY` | Server | x402 payee, Gateway withdrawals |
| `BUYER_ADDRESS` / `BUYER_PRIVATE_KEY` | Scripts | Agent buyer wallet |
| `SWARM_INGEST_SECRET` | Server | Auth for `POST /api/swarm/ingest` |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Server | Optional Upstash for swarm state |

Repo root `.env` (for Python swarm):

| Variable | Purpose |
| --- | --- |
| `LIVE_X402=1` | Enable real x402 mesh |
| `X402_BASE_URL` | Seller URL (localhost or Vercel) |
| `SWARM_INGEST_URL` | Vercel ingest endpoint |
| `SETTLEMENT_API_URL` | Creator registry base URL |
| `DEEPSEEK_API_KEY` | LLM oracle (optional) |
| `SWARM_SESSION_BUDGET_USDC` | Strategist budget cap |

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm run start` | Production server (recommended for x402) |
| `npm run generate-wallets` | Create seller + buyer keys |
| `npm run fund-buyer` | Send test USDC to buyer |
| `npm run pay-mesh` | Execute x402 mesh from JSON intents |
| `npm run agent` | LangChain deep agent buyer (Circle template) |
| `npm run verify-supabase` | Check DB connectivity |

---

## Operator dashboard

`/dashboard` (login required):

- **Gateway balance** — seller USDC in Circle Gateway
- **Payments table** — x402 events with Arcscan links (when tx is `0x` hash)
- **Withdraw** — cross-chain testnet withdrawal

Demo login (local only):

| Email | Password |
| --- | --- |
| `admin@example.com` | `123456` |

---

## How it works

- [Next.js](https://nextjs.org/) App Router + [Supabase](https://supabase.com/) Postgres
- [x402](https://www.x402.org/) HTTP 402 nanopayments with USDC on [Arc](https://arc.circle.com/)
- [Circle x402 batching](https://www.npmjs.com/package/@circle-fin/x402-batching) — gasless Gateway settlements
- Creator citation routing in `lib/settlement/resolve.ts` — matches `?source=` to registry URLs
- Swarm state from `../agents/swarm_api.py` via ingest API
- [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com/)

---

## Security

- Testnet only — not production-ready without hardening
- Secrets via environment variables — never commit `.env.local`
- Service role key server-side only
- Swarm ingest protected by shared secret

See [SECURITY.md](./SECURITY.md).

---

## Related docs

- [Root README](../README.md) — full project, judges, Arc OSS
- [Lepton form copy](../docs/LEPTON_SUBMISSION.md)
- [Settlement layer](../settlement/README.md)
- [What is SymbioMarket](../docs/WHAT_IS_SYMBIOMARKET.md)

Based on [Circle arc-nanopayments-demo](https://github.com/akelani-circle/arc-nanopayments-demo), extended for creator micropayments and multi-agent settlement.
