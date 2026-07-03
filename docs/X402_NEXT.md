# Circle x402 real USDC — what you need next

SymbioMarket **already has** the Circle nanopayments template in `arc-nanopayments/`. The **agent swarm + FHE + Arc pulse** work without this. x402 is the **next layer** for real micro-USDC in the Payments tab.

## Do you have what you need?

| Requirement | You have? | Notes |
|-------------|-----------|--------|
| Node 22+ | Check `node -v` | Required by template |
| Supabase project **or** Docker | Pick one path | Stores payment events for dashboard |
| Seller + buyer wallets | `npm run generate-wallets` | Written to `.env.local` |
| Testnet USDC on buyer | [Circle faucet](https://faucet.circle.com/) | Fund **buyer** wallet |
| OpenAI key | Optional | Agent mock mode works without it |

Your **Arc / Sepolia keys** in repo `.env` are separate from x402 — you can reuse the same wallet address if you fund it for Gateway.

## Circle x402 fix (Lepton Phase 2)

Payment requirements must use **`maxTimeoutSeconds: 604900`** (7+ days). Shorter windows fail with `authorization_validity_too_short` from Circle Gateway.

**Wallets:** run `npm run generate-wallets` — seller and buyer must be **different** addresses. Fund buyer from your legacy Arc wallet: `npm run fund-buyer`.

**Smoke test (5 real payments, exits):**

```powershell
cd arc-nanopayments
npm run dev
npm run pay-once
```


1. **Supabase** (choose one):
   - **Local:** Docker + `npx supabase start` + `npx supabase migration up`
   - **Cloud:** `npx supabase link` + `npx supabase db push`

2. **Env file:**

   ```powershell
   cd c:\Users\dell\cursor-symbio\Symbiomarket\arc-nanopayments
   copy .env.example .env.local
   ```

   Fill in from Supabase dashboard (Settings → API):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Wallets:**

   ```powershell
   npm run generate-wallets
   ```

   Fund buyer with testnet USDC (faucet instructions print in terminal).

4. **Run:**

   ```powershell
   npm run dev
   ```

   Sign in: `admin@example.com` / `123456` → **Payments** tab (light Circle UI like `public/screenshot.png`).

5. **Trigger payments** — run the LangChain buyer agent per `arc-nanopayments/README.md` (`npm run agent` or documented script).

## How this fits SymbioMarket

| View | URL | Purpose |
|------|-----|---------|
| Agent + FHE + Arc | `/swarm` | Dark SymbioMarket demo |
| Circle USDC | `/dashboard` → Payments | Real x402 nanopayments |
| Both | Same repo | Grant story: agents + confidential layer + Circle settlement |

## Not required for grant video

If your deadline is soon, **record the demo with `/swarm` + `npm run sync:swarm`** first. Add x402 when you have Supabase + faucet time.

When you paste the **grant form**, we can map each question to these URLs and proof txs.
