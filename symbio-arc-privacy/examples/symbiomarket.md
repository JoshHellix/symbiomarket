# Integrate with SymbioMarket

SymbioMarket is the reference app: four agents pay creators via x402 on Arc; this repo holds the **confidential sidecar**.

## Flow

```
swarm_api.py (agents pay USDC on Arc)
    → swarm_data.json
    → npm run sync:swarm (fhe-contracts or this repo)
    → Sepolia FHE ledger update
    → arc_settle_swarm.py → Arc public pulse
    → push to Vercel /api/fhe/state
```

## From SymbioMarket monorepo

```powershell
cd fhe-contracts
npm run sync:swarm
```

## From this standalone repo

Export the latest payment:

```json
{
  "cycle": 42,
  "payments": [{
    "from": "Executor",
    "to": "SettlementLayer",
    "amount": 0.001,
    "purpose": "creator_citation",
    "tx_id": "MESH-000042-EXE"
  }]
}
```

Save as `payment.json`, then:

```powershell
set PAYMENT_JSON=payment.json
npm run sync:payment
```

## Lepton pitch line

> Agents pay in public USDC on Arc; fleet totals stay confidential on Sepolia FHE — fork `symbio-arc-privacy` to add privacy to your Arc app.
