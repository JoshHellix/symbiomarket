"""
Maps each swarm agent role to a settlement-layer payment intent.

Phase 1: structured intents in swarm_data.json (live x402 in Phase 2).
"""

from __future__ import annotations

from typing import Any

from creator_registry import fetch_creators

ROLE_ENDPOINTS: dict[str, dict[str, str]] = {
    "Oracle": {
        "endpoint": "/api/premium/quote",
        "price_usd": "$0.001",
        "purpose": "oracle_intel",
    },
    "Strategist": {
        "endpoint": "/api/premium/dataset",
        "price_usd": "$0.01",
        "purpose": "strategy_routing",
    },
    "Executor": {
        "endpoint": "/api/premium/citation",
        "price_usd": "$0.001",
        "purpose": "creator_citation",
    },
    "Evaluator": {
        "endpoint": "/api/premium/agent-task",
        "price_usd": "$0.001",
        "purpose": "spend_review",
    },
}


def _payees() -> list[dict[str, Any]]:
    return [
        {
            "creator_id": p["creator_id"],
            "name": p["name"],
            "split_bps": p["split_bps"],
            "wallet": p.get("wallet", "pending_registration"),
            "feed_url": p.get("feed_url", ""),
        }
        for p in fetch_creators()
    ]


def build_payment_mesh(
    cycle_num: int,
    strategist_decision: str,
    pnl: float,
) -> list[dict[str, Any]]:
    """One payment intent per agent role — depth-4 mesh per cycle."""
    mesh: list[dict[str, Any]] = []

    for role, route in ROLE_ENDPOINTS.items():
        intent: dict[str, Any] = {
            "mesh_id": f"MESH-{cycle_num:06d}-{role[:3].upper()}",
            "role": role,
            "endpoint": route["endpoint"],
            "price_usd": route["price_usd"],
            "purpose": route["purpose"],
            "mode": "simulated",
            "gateway_tx": None,
            "arc_tx": None,
        }

        if role == "Executor":
            payees = _payees()
            primary = payees[(cycle_num - 1) % len(payees)] if payees else None
            intent["payees"] = payees
            feed = primary.get("feed_url") if primary else f"https://symbiomarket.vercel.app/feeds/cycle-{cycle_num}"
            if isinstance(feed, str) and feed:
                intent["endpoint"] = (
                    f"{route['endpoint']}?source={feed}"
                )
            else:
                intent["endpoint"] = (
                    f"{route['endpoint']}?source=https://symbiomarket.vercel.app/feeds/cycle-{cycle_num}"
                )
        elif role == "Strategist" and strategist_decision == "hold":
            intent["skipped"] = True
            intent["skip_reason"] = "budget_hold — strategist deferred paid routing"
        elif role == "Evaluator" and pnl < 0:
            intent["purpose"] = "spend_review_negative_pnl"

        mesh.append(intent)

    return mesh


def mesh_to_legacy_payments(mesh: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Flatten mesh for the existing nanopayment feed UI."""
    rows: list[dict[str, Any]] = []
    for item in mesh:
        if item.get("skipped"):
            continue
        rows.append(
            {
                "tx_id": item["mesh_id"],
                "from": item["role"],
                "to": "SettlementLayer",
                "amount": float(item.get("amount_usdc") or item["price_usd"].replace("$", "")),
                "purpose": item["purpose"],
                "endpoint": item["endpoint"],
                "mode": item.get("mode", "simulated"),
                "gateway_tx": item.get("gateway_tx"),
                "payer": item.get("payer"),
                "payees": item.get("payees"),
            }
        )
    return rows
