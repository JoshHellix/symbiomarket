# Paste-ready: what SymbioMarket is

Copy any block below into Discord, hackathon forms, X, LinkedIn, or your README intro.

---

## Ultra-short (one line)

**SymbioMarket** — four AI agents with their own USDC wallet on Arc; they autonomously pay creators and data providers per use (sub-cent x402 micropayments), plus open settlement infrastructure other builders can plug into.

---

## Short (~80 words)

**SymbioMarket** is an AI team with its own petty cash on Arc. Four agents — Oracle, Strategist, Executor, and Evaluator — decide what to buy and pay creators and data providers per use in sub-cent USDC, not monthly subscriptions. Under the hood, it is open **settlement infrastructure**: register creator feeds, set split rules, and reuse the same x402 + Arc plumbing from your own app. Built for the Lepton hackathon (Canteen × Circle).

Live: https://symbiomarket.vercel.app/swarm  
GitHub: https://github.com/JoshHellix/Symbiomarket

---

## Medium (~150 words — forms / judge pitch)

**SymbioMarket** — autonomous agent economy + creator micropayments on Arc.

We run a four-agent loop (Oracle → Strategist → Executor → Evaluator) that **autonomously pays** for x402-protected data and creator content in real USDC on Arc testnet — quotes, datasets, citation unlocks, and agent tasks each cycle, with budget-aware skips when the Strategist holds.

The same codebase exposes a **settlement layer** for other builders: creator registry API, citation paywall, and a live treasury dashboard. Agents are the demo; infrastructure is what scales.

Stack: Circle Gateway + x402, Arc USDC, Python swarm, Next.js dashboard, optional Zama FHE for confidential fleet spend.

GitHub: https://github.com/JoshHellix/Symbiomarket  
Live: https://symbiomarket.vercel.app/swarm

---

## Problem → solution (bullet pitch)

**Problem:** Creators cannot charge $0.01 per article; AI agents need data but have no wallet or budget rules; Arc proves tiny USDC works but someone still needs the books.

**Solution:** SymbioMarket gives a four-agent team a shared USDC budget on Arc. Each cycle they pay for x402-gated feeds and creator content in real micropayments. Other devs can use the same settlement APIs (creator registry, paywalls, treasury) without rebuilding Circle/x402 from scratch.

---

## Founder line (optional)

Built by Ikoro Joshua Klau (Nigeria) for Lepton — targeting live autonomous USDC agent payments, not simulated dashboards.
