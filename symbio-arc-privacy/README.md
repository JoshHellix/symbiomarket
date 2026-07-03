# SymbioMarket — Arc Confidential Settlement Kit

**Forkable privacy layer for Arc builders** — encrypt agent spend totals on Sepolia (Zama fhEVM), settle in public USDC on Arc testnet.

Built by [SymbioMarket](https://github.com/JoshHellix/Symbiomarket). Submitted to the **[Arc Open Source Showcase](https://forms.gle/LDCYyqT8ayp8Tp3Y6)**.

---

## Why this repo exists

Circle judges asked for a **standalone repo** Arc builders can fork for **privacy on Arc**. Zama fhEVM does not run on Arc L2 today — so this kit uses a **dual-layer pattern**:

| Layer | Chain | What happens |
|-------|-------|----------------|
| **Confidential ledger** | Ethereum Sepolia | Payment amounts encrypted; homomorphic sum on-chain |
| **Public settlement** | Arc testnet | USDC pulse / proof tx (amounts visible for Arc explorers) |

You get **confidential fleet economics** without waiting for Arc-native FHE.

---

## Quick start

```powershell
git clone https://github.com/JoshHellix/symbio-arc-privacy.git
cd symbio-arc-privacy
npm install
copy .env.example .env
# Edit .env — FHE_PRIVATE_KEY + Sepolia RPC
npm run compile
npm run deploy:sepolia
```

Copy `FHE_COUNTER_ADDRESS` into `.env`, then:

```powershell
npm run increment:sepolia
```

---

## Sync a payment (from SymbioMarket or any JSON)

```powershell
# Point at a swarm payment export
set PAYMENT_JSON=C:\path\to\payment.json
npm run sync:payment
```

Or integrate with SymbioMarket (see `examples/symbiomarket.md`).

---

## Arc public settlement

After FHE sync, run Arc settlement from the main SymbioMarket repo:

```powershell
cd ../Symbiomarket/fhe-contracts
npm run arc:settle
```

Or use `scripts/arc-settle-note.md` for wiring your own Arc RPC + wallet.

---

## What you can fork

- `contracts/FHECounter.sol` — minimal encrypted counter (extend to your ledger)
- `scripts/sync-payment.ts` — encrypt micro-USDC → increment → decrypt total
- `scripts/deploy.ts` / `increment-counter.ts` — deploy + smoke test
- Architecture docs below

---

## Arc-native FHE?

**Not available via Zama fhEVM on Arc today.** This repo documents the **bridge pattern** judges asked about: Sepolia confidentiality + Arc settlement. If Arc-native FHE ships, swap the Sepolia layer and keep the Arc settlement script.

---

## Showcase submission

Fill the form when your repo is public:

**[Arc Open Source Showcase →](https://forms.gle/LDCYyqT8ayp8Tp3Y6)**

List this repo as: *“Confidential agent spend ledger + Arc USDC settlement bridge for Arc builders.”*

---

## Links

- Main app: [SymbioMarket](https://github.com/JoshHellix/Symbiomarket)
- Live demo: https://arc-nanopayments-dun.vercel.app/swarm
- Zama fhEVM: https://docs.zama.ai/protocol

## License

BSD-3-Clause-Clear (contract) · Apache-2.0 (scripts) — match your deployment needs.
