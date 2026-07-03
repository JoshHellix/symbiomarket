# What is SymbioMarket?

Plain English. For judges, Discord, X, and anyone who asks in 30 seconds.

---

## The one sentence

**SymbioMarket pays creators when AI and agents cite their content — register your feed, get sub-cent USDC per use on Arc, with an open registry and citation toll any app can plug into.**

---

## It is both: agents and infrastructure

| | Agent project | Infrastructure |
|---|---------------|----------------|
| **What it is** | Four AI workers that decide and pay on their own | Wallets, budgets, paywalls, split payouts, treasury dashboard |
| **Who cares** | Anyone asking "what does it do?" | Other devs who want micropayments without rebuilding Arc/x402 |
| **Demo** | Watch Oracle → Strategist → Executor → Evaluator run a cycle | Register a creator feed, set split %, see txs on the dashboard |

Same product. Agents are the demo. Infrastructure is what makes it scale and what helps Arc.

**Analogy:** Uber matches drivers and riders (the product you see) and runs payments and routing underneath (the platform). SymbioMarket's agents are the riders; the settlement layer is the platform.

---

## What problem does it solve?

1. **Creators** cannot charge one cent per article or API call — fees force $10/month subscriptions.
2. **AI agents** need data and content but have no wallet and no budget discipline.
3. **Arc** proves tiny USDC payments work — but someone still needs the **books, wallets, and rules**.

SymbioMarket connects all three: agents spend small USDC amounts; creators get paid when their work is used; everything clears on Arc.

---

## The four agents (simple)

| Agent | Plain job |
|-------|-----------|
| **Oracle** | Buys cheap data / signals ("what's going on?") |
| **Strategist** | Chooses what's worth paying for ("skip the expensive feed today") |
| **Executor** | Pays creators when their content is used |
| **Evaluator** | Checks if the spend was worth it |

Each role can map to a real x402 payment on Arc — not just a row in a table.

---

## What other builders can use

The **settlement layer** (open in this repo):

- **Creator registry** — name, feed URL, wallet, revenue split %
- **x402 paywalls** — e.g. per citation, per quote, per dataset unlock
- **Treasury view** — who paid whom, Arc transaction links
- **API** — `GET/POST /api/settlement/creators` (see `settlement/README.md`)

A music-server sidecar, RSS tool, or another agent team can call the same APIs without forking Circle's template from scratch.

---

## How this helps Arc

- Shows **many sub-cent USDC payments**, not one big demo transfer
- Shows **agents as real economic actors** with wallets on Arc testnet
- Shows **creator economy** — payees earn per use
- Uses **Circle stack** end to end: Gateway, x402, USDC, wallets
- Gives Arc a **reference story**: "this is what the chain is for when payments are too small for cards"

---

## Copy-paste for Lepton submission

**Project name:** SymbioMarket

**What it does:** A four-agent system that autonomously pays for data and creator content in sub-cent USDC on Arc. Under the hood, an open settlement layer lets other builders register creators, set split rules, and use the same x402 + Arc plumbing.

**User problem:** Creators and APIs are stuck behind subscriptions; agents cannot pay per use. We fix both with per-request USDC on Arc.

**For returning Agora teams:** Agora shipped a simulated agent dashboard. Lepton adds real USDC, creator split payouts, and a reusable settlement API.

---

## What it is not

- Not a crypto trading bot
- Not a Patreon clone for normal consumers (yet)
- Not 24/7 unless the swarm process is running (dashboard can stay online via Vercel)
