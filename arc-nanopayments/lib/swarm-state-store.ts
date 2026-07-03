/**
 * Swarm + FHE state: local JSON (dev) | Upstash KV | Supabase (free) | Vercel Blob (prod).
 */

import { get, put } from "@vercel/blob";
import { readFile } from "fs/promises";
import { join } from "path";
import { Redis } from "@upstash/redis";
import { getServiceSupabase } from "@/lib/supabase/service";

const SWARM_KEY = "symbio:swarm";
const FHE_KEY = "symbio:fhe";
const SWARM_ROW = "swarm";
const FHE_ROW = "fhe";
const SWARM_BLOB = "symbio/swarm.json";
const FHE_BLOB = "symbio/fhe.json";

export const EMPTY_SWARM = {
  cycle: 0,
  market: null,
  agents: {} as Record<string, unknown>,
  cycles: [] as unknown[],
  payments: [] as unknown[],
};

function hasKv(): boolean {
  const url =
    process.env.KV_REST_API_URL?.trim() ||
    process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token =
    process.env.KV_REST_API_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  return !!(url && token);
}

function kvConfig(): { url: string; token: string } | null {
  const url =
    process.env.KV_REST_API_URL?.trim() ||
    process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token =
    process.env.KV_REST_API_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url, token };
}

function hasBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN?.trim();
}

function redis(): Redis | null {
  const cfg = kvConfig();
  if (!cfg) return null;
  return new Redis({ url: cfg.url, token: cfg.token });
}

async function readLocalJson(filename: string): Promise<Record<string, unknown> | null> {
  if (process.env.VERCEL === "1") return null;

  const candidates =
    filename === "swarm_data.json" || filename === "fhe_sync_state.json"
      ? [join(process.cwd(), "..", filename)]
      : [join(process.cwd(), filename)];

  for (const filePath of candidates) {
    try {
      const raw = await readFile(filePath, "utf-8");
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      continue;
    }
  }
  return null;
}

async function getBlobJson(pathname: string): Promise<Record<string, unknown> | null> {
  if (!hasBlob()) return null;
  try {
    const result = await get(pathname, { access: "private", useCache: false });
    if (!result) return null;
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function setBlobJson(pathname: string, data: unknown): Promise<void> {
  if (!hasBlob()) throw new Error("BLOB_READ_WRITE_TOKEN not configured");
  await put(pathname, JSON.stringify(data), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

function hasSupabaseRemote(): boolean {
  return !!getServiceSupabase();
}

async function getSupabaseJson(rowKey: string): Promise<Record<string, unknown> | null> {
  const supabase = getServiceSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("symbio_remote_state")
    .select("data")
    .eq("key", rowKey)
    .maybeSingle();
  if (error || !data?.data || typeof data.data !== "object") return null;
  return data.data as Record<string, unknown>;
}

async function setSupabaseJson(rowKey: string, payload: unknown): Promise<void> {
  const supabase = getServiceSupabase();
  if (!supabase) throw new Error("Supabase service role not configured");
  const { error } = await supabase.from("symbio_remote_state").upsert({
    key: rowKey,
    data: payload,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export type StateSource = "kv" | "supabase" | "blob" | "local" | "empty";

export async function getSwarmState(): Promise<{
  data: Record<string, unknown>;
  source: StateSource;
}> {
  const r = redis();
  if (r) {
    const cached = await r.get<Record<string, unknown>>(SWARM_KEY);
    if (cached && typeof cached === "object") {
      return { data: cached, source: "kv" };
    }
  }

  const supa = await getSupabaseJson(SWARM_ROW);
  if (supa) return { data: supa, source: "supabase" };

  const blob = await getBlobJson(SWARM_BLOB);
  if (blob) return { data: blob, source: "blob" };

  if (process.env.VERCEL === "1") {
    return {
      data: {
        ...EMPTY_SWARM,
        message:
          "Waiting for swarm push — set Supabase (free) or run swarm locally. See docs/FREE_LIVE_DEMO.md",
      },
      source: "empty",
    };
  }

  const local = await readLocalJson("swarm_data.json");
  if (local) return { data: local, source: "local" };
  return { data: EMPTY_SWARM, source: "empty" };
}

export async function getFheState(): Promise<{
  data: Record<string, unknown>;
  source: StateSource;
}> {
  const r = redis();
  if (r) {
    const cached = await r.get<Record<string, unknown>>(FHE_KEY);
    if (cached && typeof cached === "object") {
      return { data: cached, source: "kv" };
    }
  }

  const supa = await getSupabaseJson(FHE_ROW);
  if (supa) return { data: supa, source: "supabase" };

  const blob = await getBlobJson(FHE_BLOB);
  if (blob) return { data: blob, source: "blob" };

  if (process.env.VERCEL === "1") {
    return {
      data: {
        cycle: 0,
        fhe: null,
        arc: null,
        message: "Waiting for FHE/Arc push from local sync:swarm.",
      },
      source: "empty",
    };
  }

  const local = await readLocalJson("fhe_sync_state.json");
  if (local) return { data: local, source: "local" };
  return {
    data: { cycle: 0, fhe: null, message: "Run: cd fhe-contracts && npm run sync:swarm" },
    source: "empty",
  };
}

export async function setSwarmState(data: unknown): Promise<{ accepted: boolean; reason?: string }> {
  const incoming = data as Record<string, unknown>;
  const incomingCycle =
    typeof incoming.cycle === "number" && Number.isFinite(incoming.cycle)
      ? incoming.cycle
      : 0;

  const { data: existing } = await getSwarmState();
  const existingCycle =
    typeof existing.cycle === "number" && Number.isFinite(existing.cycle)
      ? existing.cycle
      : 0;

  if (incomingCycle > 0 && existingCycle > 0 && incomingCycle < existingCycle) {
    return {
      accepted: false,
      reason: `stale cycle ${incomingCycle} < stored ${existingCycle}`,
    };
  }

  const r = redis();
  if (r) {
    await r.set(SWARM_KEY, data);
    return { accepted: true };
  }
  if (hasSupabaseRemote()) {
    await setSupabaseJson(SWARM_ROW, data);
    return { accepted: true };
  }
  await setBlobJson(SWARM_BLOB, data);
  return { accepted: true };
}

export async function setFheState(data: unknown): Promise<void> {
  const r = redis();
  if (r) {
    await r.set(FHE_KEY, data);
    return;
  }
  if (hasSupabaseRemote()) {
    await setSupabaseJson(FHE_ROW, data);
    return;
  }
  await setBlobJson(FHE_BLOB, data);
}

export function isRemoteIngestEnabled(): boolean {
  return (
    (hasKv() || hasSupabaseRemote() || hasBlob()) &&
    !!process.env.SWARM_INGEST_SECRET?.trim()
  );
}

export function remoteStorageKind(): "kv" | "supabase" | "blob" | "none" {
  if (hasKv()) return "kv";
  if (hasSupabaseRemote()) return "supabase";
  if (hasBlob()) return "blob";
  return "none";
}
