"""
LLM Oracle for swarm_api.py — addresses judge feedback on shallow / non-LLM oracle.

Set DEEPSEEK_API_KEY in repo .env. Falls back to rule-based signal if missing or on error.
"""

from __future__ import annotations

import json
import os
import re

from market_feed import fetch_market_snapshot


def _rule_oracle(market: dict) -> dict:
    trend = market.get("trend", "neutral")
    if trend == "bullish":
        signal = "buy"
    elif trend == "bearish":
        signal = "sell"
    elif trend == "volatile":
        signal = "hold"
    else:
        signal = "hold"
    return {
        "signal": signal,
        "confidence": 0.72,
        "reason": f"Rule fallback on {market.get('source', 'market')} trend={trend}",
        "mode": "rules",
    }


async def oracle_act(market: dict | None = None) -> dict:
    market = market or fetch_market_snapshot()
    api_key = (os.getenv("DEEPSEEK_API_KEY") or "").strip()
    if not api_key:
        out = _rule_oracle(market)
        out["market"] = market
        return out

    try:
        from langchain_deepseek import ChatDeepSeek

        llm = ChatDeepSeek(
            model="deepseek-chat",
            temperature=0.2,
            api_key=api_key,
        )
        prompt = f"""You are the Oracle agent in SymbioMarket — an autonomous payment swarm on Arc.
Analyze this LIVE market snapshot and decide what data feeds are worth paying for this cycle.

Market JSON:
{json.dumps(market, indent=2)}

Return ONLY valid JSON (no markdown):
{{
  "signal": "buy|sell|hold",
  "confidence": 0.0-1.0,
  "reason": "one sentence citing the live data",
  "data_priority": "high|medium|low",
  "suggested_feed": "quote|dataset|none"
}}"""
        resp = await llm.ainvoke(prompt)
        raw = (resp.content or "").strip()
        raw = re.sub(r"^```json\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        data = json.loads(raw)
        confidence = float(data.get("confidence", 0.7))
        if confidence > 1:
            confidence /= 100.0
        return {
            "signal": str(data.get("signal", "hold")).lower(),
            "confidence": max(0.0, min(1.0, confidence)),
            "reason": str(data.get("reason", ""))[:240],
            "data_priority": data.get("data_priority", "medium"),
            "suggested_feed": data.get("suggested_feed", "quote"),
            "mode": "llm",
            "market": market,
        }
    except Exception as exc:
        out = _rule_oracle(market)
        out["reason"] = f"LLM error ({exc}); {out['reason']}"
        out["mode"] = "rules_fallback"
        out["market"] = market
        return out
