# Citation toll — integration guide

SymbioMarket charges **per citation** when an agent or app grounds content in a registered URL.

---

## Flow

```
1. Creator registers at /register (feed URL + Arc wallet)
2. Buyer (agent, LLM app) calls:
   GET /api/premium/citation?source=https://creator.com/post/1
3. x402 payment (~$0.001 USDC) on Arc testnet
4. Response includes attribution excerpt + payee wallet(s)
```

---

## Registry lookup

The `source` query param is matched against registered `feedUrl` values:

- Exact match or prefix (article under feed root)
- Same hostname as registered feed

Implementations: `arc-nanopayments/lib/settlement/resolve.ts`

---

## Register via API

```bash
curl -X POST https://arc-nanopayments-dun.vercel.app/api/settlement/creators \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Blog",
    "feedUrl": "https://myblog.com",
    "wallet": "0xYourArcWallet",
    "splitBps": 10000
  }'
```

---

## Pay as a buyer (Node)

```powershell
cd arc-nanopayments
npm run pay-once
# or point agent at citation endpoint in pay-mesh intents
```

Requires `BUYER_PRIVATE_KEY` and seller running (`npm run dev` or deployed).

---

## Outreach copy (no crypto lead)

> "When AI tools cite your articles, you don't get paid. We route a micro-payment to your wallet each time an agent unlocks attribution for your URL."

---

## Related

- [Canteen — LLM Citation-Toll Layer (RFB #7)](https://thecanteenapp.com/analysis/2026/05/28/distribution-bootstrap-payments-founders.html)
- [`settlement/README.md`](../settlement/README.md)
