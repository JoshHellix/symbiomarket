"""
Push swarm_data.json (+ optional fhe_sync_state.json) to deployed Vercel ingest API.

Set in repo root .env:
  SWARM_INGEST_URL=https://your-app.vercel.app/api/swarm/ingest
  SWARM_INGEST_SECRET=your-random-secret

Called automatically from swarm_api.py each cycle when URL + secret are set.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request

from dotenv import load_dotenv

from repo_paths import symbio_root, swarm_data_path

load_dotenv(symbio_root() / ".env")


def _read_json(path) -> dict | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def push_every_n() -> int:
    """Push to Vercel every N cycles (1 = every cycle). Default 6 on Hobby."""
    raw = (os.getenv("SWARM_PUSH_EVERY") or "6").strip()
    try:
        n = int(raw)
    except ValueError:
        n = 6
    return max(1, n)


def should_push_remote(cycle_num: int) -> bool:
    n = push_every_n()
    if n == 1:
        return True
    return cycle_num == 1 or cycle_num % n == 0


def push_remote_state(swarm: dict | None = None, include_fhe: bool = True) -> bool:
    url = (os.getenv("SWARM_INGEST_URL") or "").strip().rstrip("/")
    secret = (os.getenv("SWARM_INGEST_SECRET") or "").strip()
    if not url or not secret:
        return False

    if swarm is None:
        swarm = _read_json(swarm_data_path())
    if not swarm:
        return False

    payload: dict = {"swarm": swarm}
    if include_fhe:
        fhe_path = symbio_root() / "fhe_sync_state.json"
        fhe = _read_json(fhe_path)
        if fhe:
            payload["fhe"] = fhe

    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url if url.endswith("/ingest") else f"{url}/api/swarm/ingest",
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {secret}",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            try:
                meta = json.loads(body)
                storage = meta.get("storage", "?")
            except json.JSONDecodeError:
                storage = "?"
            print(f"[push] ok ({storage})")
            return 200 <= resp.status < 300
    except urllib.error.HTTPError as e:
        print(f"[push] HTTP {e.code}: {e.read().decode('utf-8', errors='replace')[:200]}")
    except OSError as e:
        print(f"[push] failed: {e}")
    return False


if __name__ == "__main__":
    ok = push_remote_state()
    if not ok:
        print("[push] skipped or failed")
