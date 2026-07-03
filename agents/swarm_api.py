import json
import random
import asyncio
import os
from datetime import datetime

from dotenv import load_dotenv

from repo_paths import swarm_data_path
from settlement_intents import build_payment_mesh, mesh_to_legacy_payments
from live_x402 import apply_live_mesh, live_x402_enabled, settlement_stats
from market_feed import fetch_market_snapshot
from oracle_llm import oracle_act

load_dotenv(swarm_data_path().parent / ".env")

try:
    from push_swarm_state import push_remote_state, should_push_remote, push_every_n
except ImportError:
    def push_remote_state(swarm=None, include_fhe=True):
        return False

    def should_push_remote(cycle_num: int) -> bool:
        return False

    def push_every_n() -> int:
        return 6

# ---------------------------
# SWARM MEMORY (LEARNING STATE)
# ---------------------------
swarm_memory = {
    "oracle_bias": 1.0,
    "risk_factor": 1.0,
    "learning_rate": 0.02
}

# ---------------------------
# AGENTS (IDENTITY LAYER)
# ---------------------------
AGENTS = ["Oracle", "Strategist", "Executor", "Evaluator"]

data = {
    "cycles": [],
    "payments": [],
    "agents": {
        "Oracle": {"status": "active"},
        "Strategist": {"status": "active"},
        "Executor": {"status": "active"},
        "Evaluator": {"status": "active"}
    }
}

# ---------------------------
# MARKET — live feed (CoinGecko), not pure random
# ---------------------------


def session_budget_usdc() -> float:
    raw = (os.getenv("SWARM_SESSION_BUDGET_USDC") or "0.15").strip()
    try:
        return max(0.01, float(raw))
    except ValueError:
        return 0.15


# ---------------------------
# ORACLE — LLM when DEEPSEEK_API_KEY set (see oracle_llm.py)
# ---------------------------


# ---------------------------
# STRATEGIST — budget + feed priority (RFB 6: pay vs skip)
# ---------------------------


def strategist_act(oracle_msg, market, session_spent: float, budget: float):
    risk = swarm_memory["risk_factor"]

    if session_spent >= budget:
        return {
            "decision": "hold",
            "bias": 0,
            "reason": f"session budget ${budget:.4f} reached (${session_spent:.4f} spent)",
        }

    if oracle_msg.get("data_priority") == "low":
        return {
            "decision": "hold",
            "bias": 0,
            "reason": "oracle marked low data priority — defer paid feeds",
        }

    if market.get("volatility", 0) > 0.09:
        return {
            "decision": "hold",
            "bias": 0,
            "reason": "high volatility — strategist deferred routing spend",
        }

    confidence = oracle_msg.get("confidence", 0.5)
    if confidence < 0.65 * risk:
        return {
            "decision": "hold",
            "bias": 0,
            "reason": f"confidence {confidence:.2f} below risk-adjusted threshold",
        }

    signal = oracle_msg.get("signal", "hold")
    if signal == "hold":
        decision = "hold"
    else:
        decision = signal

    bias = 1 if decision == "buy" else -1 if decision == "sell" else 0

    return {
        "decision": decision,
        "bias": bias,
        "reason": oracle_msg.get("reason", "proceed with paid data/creator routes"),
    }

# ---------------------------
# EXECUTOR (PNL ENGINE)
# ---------------------------


def executor_act(strategy_msg, market):
    """PnL per cycle — must vary even on 'hold' or the dashboard chart stays flat."""
    bias = strategy_msg["bias"]
    micro = random.uniform(-0.12, 0.12)
    price_drift = (market["price"] - 100) * 0.003

    if bias == 0:
        # Hold: small inventory / fee drift (not zero)
        pnl = micro + price_drift
    else:
        pnl = bias * random.uniform(0.2, 2.0) + micro + price_drift * 0.5

    return round(pnl, 6)

# ---------------------------
# EVALUATOR (LEARNING LOOP)
# ---------------------------


def evaluator_act(pnl):
    lr = swarm_memory["learning_rate"]

    if pnl > 0:
        swarm_memory["oracle_bias"] *= (1 + lr)
        swarm_memory["risk_factor"] *= 0.99
    else:
        swarm_memory["oracle_bias"] *= (1 - lr)
        swarm_memory["risk_factor"] *= 1.01

    swarm_memory["oracle_bias"] = max(
        0.5, min(1.5, swarm_memory["oracle_bias"]))
    swarm_memory["risk_factor"] = max(
        0.7, min(1.5, swarm_memory["risk_factor"]))

    return {
        "oracle_bias": swarm_memory["oracle_bias"],
        "risk_factor": swarm_memory["risk_factor"]
    }

# ---------------------------
# MAIN SWARM LOOP
# ---------------------------


async def update_cycle(cycle_num):
    market = fetch_market_snapshot()
    budget = session_budget_usdc()
    stats_before = settlement_stats()
    session_spent = float(stats_before.get("live_usdc", 0))

    oracle = await oracle_act(market)
    strategist = strategist_act(oracle, market, session_spent, budget)
    pnl = executor_act(strategist, market)
    evaluation = evaluator_act(pnl)

    cycle = {
        "id": cycle_num,
        "time": datetime.now().strftime("%H:%M:%S"),
        "market": market,
        "oracle": oracle,
        "strategist": strategist,
        "executor": {
            "pnl": round(pnl, 6)
        },
        "evaluator": evaluation
    }

    # store cycles
    data["cycles"].insert(0, cycle)
    data["cycles"] = data["cycles"][:12]

    # payment mesh — one intent per agent role (settlement layer)
    mesh = build_payment_mesh(
        cycle_num,
        strategist["decision"],
        pnl,
    )
    mesh = apply_live_mesh(mesh)
    payments = mesh_to_legacy_payments(mesh)
    now = datetime.now().strftime("%H:%M:%S")
    for row in payments:
        row["time"] = now
        row["fhe_status"] = "confirmed" if row.get("mode") == "live" else "pending"

    data["payments"] = (payments + data["payments"])[:24]

    stats = settlement_stats()
    settlement_mode = "live" if live_x402_enabled() else "simulated"

    # FINAL OUTPUT (dashboard contract)
    state = {
        "cycle": cycle_num,
        "updated_at": datetime.now().isoformat(),
        "market": market,
        "agents": data["agents"],
        "memory": dict(swarm_memory),
        "cycles": data["cycles"],
        "payments": data["payments"],
        "payment_mesh": mesh,
        "settlement": {
            "layer": "SymbioMarket Settlement Core",
            "creators_api": "/api/settlement/creators",
            "register_url": "/register",
            "mode": settlement_mode,
            "live_payments_total": stats["live_payments"],
            "live_usdc_total": round(stats["live_usdc"], 6),
            "session_budget_usdc": budget,
            "x402_base": os.getenv("X402_BASE_URL", "http://localhost:3000"),
            "market_source": market.get("source"),
            "oracle_mode": oracle.get("mode"),
        },
    }

    output_path = swarm_data_path()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

    n = push_every_n()
    if should_push_remote(cycle_num) and push_remote_state(state):
        print(f"[ok] Cycle {cycle_num} -> swarm updated + pushed to Vercel (every {n} cycles)")
    elif should_push_remote(cycle_num):
        print(f"[ok] Cycle {cycle_num} -> swarm updated (push failed — check UPSTASH_SETUP.md)")
    else:
        next_push = cycle_num + (n - cycle_num % n) if cycle_num % n != 0 else cycle_num + n
        print(f"[ok] Cycle {cycle_num} -> swarm updated (push skipped — next at cycle {next_push})")


# ---------------------------
# RUN LOOP
# ---------------------------
def load_start_cycle() -> int:
    """Resume counter after restart so Vercel cycle never jumps backward."""
    try:
        path = swarm_data_path()
        if path.exists():
            with open(path, encoding="utf-8") as f:
                return int(json.load(f).get("cycle", 0))
    except (OSError, json.JSONDecodeError, TypeError, ValueError):
        pass
    return 0


async def main():
    mode = "LIVE x402" if live_x402_enabled() else "simulated payments"
    start = load_start_cycle()
    print(f"Swarm Intelligence Engine started ({mode})")
    if start > 0:
        print(f"[resume] continuing from cycle {start}")

    interval = float(os.getenv("SWARM_CYCLE_SECONDS", "12" if live_x402_enabled() else "6"))

    for i in range(999999):
        await update_cycle(start + i + 1)
        await asyncio.sleep(interval)


if __name__ == "__main__":
    asyncio.run(main())
