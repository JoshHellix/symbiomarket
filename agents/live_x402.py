"""
Execute payment mesh intents via Circle x402 (Node pay-mesh script).

Set LIVE_X402=1 and X402_BASE_URL=http://localhost:3000 in repo .env
Requires arc-nanopayments/.env.local with BUYER_PRIVATE_KEY + npm run dev.
"""

from __future__ import annotations

import json
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from repo_paths import symbio_root

_live_stats = {"live_payments": 0, "live_usdc": 0.0, "failed": 0}


def live_x402_enabled() -> bool:
    return os.getenv("LIVE_X402", "").strip().lower() in ("1", "true", "yes")


def settlement_stats() -> dict[str, Any]:
    return dict(_live_stats)


def _arc_nanopayments_dir() -> Path:
    return symbio_root() / "arc-nanopayments"


def apply_live_mesh(mesh: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Run x402 for non-skipped intents; merge gateway tx ids into mesh."""
    if not live_x402_enabled():
        return mesh

    payable = [m for m in mesh if not m.get("skipped")]
    if not payable:
        return mesh

    arc_dir = _arc_nanopayments_dir()
    if not (arc_dir / ".env.local").exists():
        print("[x402] skip — arc-nanopayments/.env.local missing")
        return mesh

    payload = [
        {"mesh_id": m["mesh_id"], "endpoint": m["endpoint"], "skipped": m.get("skipped")}
        for m in mesh
    ]

    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix=".json",
        delete=False,
        encoding="utf-8",
    ) as tmp:
        json.dump(payload, tmp)
        tmp_path = tmp.name

    try:
        proc = subprocess.run(
            ["npm", "run", "pay-mesh", "--", tmp_path],
            cwd=str(arc_dir),
            capture_output=True,
            text=True,
            timeout=180,
            shell=os.name == "nt",
        )
        if proc.returncode != 0:
            print(f"[x402] pay-mesh failed: {proc.stderr or proc.stdout}")
            return mesh

        lines = [ln for ln in proc.stdout.strip().splitlines() if ln.strip()]
        raw = lines[-1] if lines else "[]"
        results = json.loads(raw)
    except (subprocess.TimeoutExpired, json.JSONDecodeError, OSError) as exc:
        print(f"[x402] error: {exc}")
        return mesh
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    by_id = {r["mesh_id"]: r for r in results if isinstance(r, dict) and "mesh_id" in r}

    for item in mesh:
        if item.get("skipped"):
            continue
        hit = by_id.get(item["mesh_id"])
        if not hit:
            continue
        if hit.get("ok"):
            item["mode"] = "live"
            item["gateway_tx"] = hit.get("gateway_tx")
            item["payer"] = hit.get("payer")
            item["amount_usdc"] = hit.get("amount")
            _live_stats["live_payments"] += 1
            if hit.get("amount"):
                try:
                    _live_stats["live_usdc"] += float(hit["amount"])
                except ValueError:
                    pass
            print(
                f"[x402] {item['role']} {item['endpoint']} -> "
                f"{hit.get('amount')} USDC tx={hit.get('gateway_tx', '—')}"
            )
        else:
            item["mode"] = "failed"
            item["error"] = hit.get("error")
            _live_stats["failed"] += 1
            print(f"[x402] fail {item['mesh_id']}: {hit.get('error')}")

    return mesh
