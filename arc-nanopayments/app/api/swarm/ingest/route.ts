/**
 * POST swarm (+ optional FHE) JSON from local Python engine → Vercel KV.
 * Auth: Authorization: Bearer SWARM_INGEST_SECRET
 */

import { NextResponse } from "next/server";
import {
  isRemoteIngestEnabled,
  remoteStorageKind,
  setFheState,
  setSwarmState,
} from "@/lib/swarm-state-store";

export async function POST(request: Request) {
  if (!isRemoteIngestEnabled()) {
    return NextResponse.json(
      { error: "Ingest not configured (Supabase, Redis, or Blob + SWARM_INGEST_SECRET)" },
      { status: 503 },
    );
  }

  const secret = process.env.SWARM_INGEST_SECRET!.trim();
  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { swarm?: unknown; fhe?: unknown };
  try {
    body = (await request.json()) as { swarm?: unknown; fhe?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.swarm && !body.fhe) {
    return NextResponse.json({ error: "Provide swarm and/or fhe payload" }, { status: 400 });
  }

  try {
    let swarmAccepted = !body.swarm;
    let swarmSkipReason: string | undefined;
    if (body.swarm) {
      const result = await setSwarmState(body.swarm);
      swarmAccepted = result.accepted;
      swarmSkipReason = result.reason;
    }
    if (body.fhe) await setFheState(body.fhe);
    return NextResponse.json({
      ok: true,
      storage: remoteStorageKind(),
      updated: { swarm: swarmAccepted, fhe: !!body.fhe },
      ...(swarmSkipReason ? { skipped: swarmSkipReason } : {}),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "KV write failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
