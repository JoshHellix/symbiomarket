"""
Real market snapshot for the swarm (not pure random).

Uses CoinGecko public API when available; falls back to last good price + small drift.
"""

from __future__ import annotations

import json
import random
import urllib.error
import urllib.request

_last_snapshot: dict | None = None


def fetch_market_snapshot() -> dict:
    """Return price/volatility/trend from live BTC+ETH data."""
    global _last_snapshot

    try:
        url = (
            "https://api.coingecko.com/api/v3/simple/price"
            "?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "SymbioMarket-Swarm/1.0"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode())

        btc = float(data["bitcoin"]["usd"])
        eth = float(data["ethereum"]["usd"])
        btc_chg = float(data["bitcoin"].get("usd_24h_change") or 0)
        eth_chg = float(data["ethereum"].get("usd_24h_change") or 0)

        composite = (btc + eth) / 2
        avg_chg = (btc_chg + eth_chg) / 2
        volatility = min(0.12, abs(avg_chg) / 100 + 0.01)

        if avg_chg > 1.5:
            trend = "bullish"
        elif avg_chg < -1.5:
            trend = "bearish"
        elif volatility > 0.06:
            trend = "volatile"
        else:
            trend = "neutral"

        snapshot = {
            "source": "coingecko",
            "btc_usd": round(btc, 2),
            "eth_usd": round(eth, 2),
            "price": round(composite, 4),
            "change_24h_pct": round(avg_chg, 4),
            "volatility": round(volatility, 6),
            "trend": trend,
        }
        _last_snapshot = snapshot
        return snapshot
    except (urllib.error.URLError, TimeoutError, KeyError, json.JSONDecodeError, OSError) as exc:
        if _last_snapshot:
            drift = random.uniform(-0.3, 0.3)
            return {
                **_last_snapshot,
                "source": "cache_drift",
                "price": round(_last_snapshot["price"] + drift, 4),
                "note": f"API unavailable ({exc}); using last snapshot",
            }
        return {
            "source": "fallback",
            "btc_usd": None,
            "eth_usd": None,
            "price": round(100 + random.uniform(-2, 2), 4),
            "change_24h_pct": 0,
            "volatility": round(random.uniform(0.02, 0.05), 6),
            "trend": random.choice(["neutral", "volatile"]),
            "note": "offline fallback — set network for live feed",
        }
