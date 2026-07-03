/**
 * Agent operator registry — Supabase when configured, else in-memory defaults.
 */

import type { AgentRecord } from "./types";
import { DEFAULT_AGENTS } from "./types";
import { getServiceSupabase } from "@/lib/supabase/service";

const globalForAgents = globalThis as typeof globalThis & {
  __symbioAgentRegistry?: AgentRecord[];
};

function memoryStore(): AgentRecord[] {
  if (!globalForAgents.__symbioAgentRegistry) {
    globalForAgents.__symbioAgentRegistry = [...DEFAULT_AGENTS];
  }
  return globalForAgents.__symbioAgentRegistry;
}

export async function listAgentsAsync(): Promise<AgentRecord[]> {
  const supabase = getServiceSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("symbio_agents")
      .select("*")
      .order("registered_at", { ascending: true });
    if (!error && data && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description ?? "",
        operatorWallet: row.operator_wallet as `0x${string}`,
        agentEndpoint: row.agent_endpoint,
        contact: row.contact ?? "",
        registeredAt: row.registered_at,
      }));
    }
  }
  return memoryStore();
}

export async function registerAgentAsync(
  input: Omit<AgentRecord, "id" | "registeredAt"> & { id?: string },
): Promise<AgentRecord> {
  const store = memoryStore();
  const id =
    input.id ??
    `agent-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48)}`;

  if (store.some((a) => a.id === id)) {
    throw new Error(`Agent id already exists: ${id}`);
  }

  const record: AgentRecord = {
    id,
    name: input.name,
    description: input.description,
    operatorWallet: input.operatorWallet,
    agentEndpoint: input.agentEndpoint,
    contact: input.contact,
    registeredAt: new Date().toISOString(),
  };

  store.push(record);

  const supabase = getServiceSupabase();
  if (supabase) {
    await persistAgent(record);
  }

  return record;
}

export async function persistAgent(record: AgentRecord): Promise<void> {
  const supabase = getServiceSupabase();
  if (!supabase) return;
  const { error } = await supabase.from("symbio_agents").upsert({
    id: record.id,
    name: record.name,
    description: record.description,
    operator_wallet: record.operatorWallet,
    agent_endpoint: record.agentEndpoint,
    contact: record.contact,
    registered_at: record.registeredAt,
  });
  if (error) console.warn("[agents] Supabase upsert failed:", error.message);
}
