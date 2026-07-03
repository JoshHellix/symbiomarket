# SymbioMarket Settlement Layer

Open infrastructure for **creator micropayments on Arc** — citation tolls + payee registry.

**Live:** https://arc-nanopayments-dun.vercel.app · **Register:** `/register` · **Docs:** [`docs/CITATION_TOLL.md`](../docs/CITATION_TOLL.md)

---

## What you get

| Piece | Purpose |
|-------|---------|
| **Creator registry** | Register a feed URL, wallet, and revenue split |
| **x402 paywalls** | Charge per citation, quote, dataset unlock, etc. |
| **Treasury dashboard** | See payments and Arc links at `/swarm` |

SymbioMarket's four agents are the **first client** of this layer. Your sidecar, plugin, or agent can be the second.

---

## Quick start for builders

### 1. List creators

```http
GET /api/settlement/creators
```

Returns registered creators with `id`, `name`, `feedUrl`, `wallet`, `splitBps`.

### 2. Register a creator (demo / hackathon)

```http
POST /api/settlement/creators
Content-Type: application/json

{
  "name": "Your Newsletter",
  "feedUrl": "https://example.com/feed.xml",
  "wallet": "0xYourArcTestnetWallet",
  "splitBps": 10000
}
```

`splitBps` is basis points out of 10_000 (10000 = 100% of that payee's share in a single-creator route).

### 3. Call a paywalled route

After payment via x402 (Circle Gateway on Arc testnet):

```http
GET /api/premium/citation?source=https://example.com/post/1
```

Price: **$0.001** per citation unlock (see route for current price).

Use the Circle buyer agent pattern in `arc-nanopayments/agent.mts` or any x402 client.

---

## Integration shapes (from Canteen distribution essay)

| Your project | How to attach |
|--------------|----------------|
| RSS / feeds | Register feed in creator registry; citation route pays on use |
| Agent framework | Point buyer wallet at `/api/premium/*` routes |
| Music / video sidecar | POST playback events → your worker calls settlement split API (coming) |

---

## Repo layout

| Path | Role |
|------|------|
| `arc-nanopayments/lib/settlement/` | Registry types and defaults |
| `arc-nanopayments/app/api/settlement/` | HTTP API |
| `arc-nanopayments/app/api/premium/` | x402 seller routes |
| `agents/settlement_intents.py` | Agent role → payment intent mapping |

---

## Requirements

- Arc testnet USDC on buyer wallet ([Circle faucet](https://faucet.circle.com/))
- Seller env: `SELLER_ADDRESS`, Supabase for payment events (see `arc-nanopayments/.env.example`)

Questions: Canteen Discord (Lepton) or GitHub issues on [JoshHellix/Symbiomarket](https://github.com/JoshHellix/Symbiomarket).
