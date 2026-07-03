"""
Fetch registered creators from the settlement API (RFB 6 traction).

Set SETTLEMENT_API_URL=https://arc-nanopayments-dun.vercel.app in repo .env
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request

DEFAULT_SPLITS = [
    {
        "creator_id": "creator-feed-alpha",
        "name": "Feed Alpha (demo)",
        "wallet": "0x0000000000000000000000000000000000000001",
        "split_bps": 4000,
        "feed_url": "https://symbiomarket.vercel.app/feeds/alpha",
    },
    {
        "creator_id": "creator-feed-beta",
        "name": "Feed Beta (demo)",
        "wallet": "0x0000000000000000000000000000000000000002",
        "split_bps": 3500,
    },
    {
        "creator_id": "creator-feed-gamma",
        "name": "Feed Gamma (demo)",
        "wallet": "0x0000000000000000000000000000000000000003",
        "split_bps": 2500,
    },
]


def _is_demo_wallet(wallet: str) -> bool:
    return wallet.lower().startswith("0x000000000000000000000000000000000000")


def settlement_base() -> str:
    raw = (
        os.getenv("SETTLEMENT_API_URL")
        or os.getenv("X402_BASE_URL")
        or "https://arc-nanopayments-dun.vercel.app"
    )
    return raw.strip().rstrip("/")


def fetch_creators() -> list[dict]:
    url = f"{settlement_base()}/api/settlement/creators"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SymbioMarket-Swarm/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode())
        creators = body.get("creators") or []
        if not creators:
            return [dict(p) for p in DEFAULT_SPLITS]
        mapped = [
            {
                "creator_id": c["id"],
                "name": c["name"],
                "wallet": c["wallet"],
                "split_bps": c.get("splitBps", c.get("split_bps", 10_000)),
                "feed_url": c.get("feedUrl", c.get("feed_url", "")),
            }
            for c in creators
            if not _is_demo_wallet(str(c.get("wallet", "")))
        ]
        return mapped if mapped else [dict(p) for p in DEFAULT_SPLITS]
    except (urllib.error.URLError, json.JSONDecodeError, OSError, KeyError):
        return [dict(p) for p in DEFAULT_SPLITS]
