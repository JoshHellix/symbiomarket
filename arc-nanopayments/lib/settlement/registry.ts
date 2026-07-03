/**
 * Creator registry — Supabase when configured, else in-memory defaults.
 */

import type { CreatorRecord } from "./types";
import { DEFAULT_CREATORS } from "./types";
import { feedUrlsMatch, normalizeFeedUrl } from "./normalize-url";
import { getServiceSupabase } from "@/lib/supabase/service";

const globalForCreators = globalThis as typeof globalThis & {
  __symbioCreatorRegistry?: CreatorRecord[];
};

function memoryStore(): CreatorRecord[] {
  if (!globalForCreators.__symbioCreatorRegistry) {
    globalForCreators.__symbioCreatorRegistry = [...DEFAULT_CREATORS];
  }
  return globalForCreators.__symbioCreatorRegistry;
}

export async function listCreatorsAsync(): Promise<CreatorRecord[]> {
  const supabase = getServiceSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("symbio_creators")
      .select("*")
      .order("registered_at", { ascending: true });
    if (!error && data && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        name: row.name,
        feedUrl: row.feed_url,
        wallet: row.wallet as `0x${string}`,
        splitBps: row.split_bps,
        registeredAt: row.registered_at,
      }));
    }
  }
  return memoryStore();
}

export function listCreators(): CreatorRecord[] {
  return memoryStore();
}

function assertUniqueRegistration(
  existing: CreatorRecord[],
  id: string,
  feedUrl: string,
): void {
  if (existing.some((c) => c.id === id)) {
    throw new Error(`Creator id already exists: ${id}`);
  }
  const duplicate = existing.find((c) => feedUrlsMatch(c.feedUrl, feedUrl));
  if (duplicate) {
    throw new Error(
      `This content URL is already registered (${duplicate.name}). Each piece or feed can only be claimed once.`,
    );
  }
}

export async function registerCreatorAsync(
  input: Omit<CreatorRecord, "id" | "registeredAt"> & { id?: string },
): Promise<CreatorRecord> {
  const existing = await listCreatorsAsync();
  const normalizedFeedUrl = normalizeFeedUrl(input.feedUrl);
  const id =
    input.id ??
    `creator-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48)}`;

  assertUniqueRegistration(existing, id, normalizedFeedUrl);

  const record: CreatorRecord = {
    id,
    name: input.name,
    feedUrl: normalizedFeedUrl,
    wallet: input.wallet,
    splitBps: input.splitBps,
    registeredAt: new Date().toISOString(),
  };

  const supabase = getServiceSupabase();
  if (supabase) {
    await persistCreator(record);
  }

  memoryStore().push(record);

  return record;
}

export function registerCreator(
  input: Omit<CreatorRecord, "id" | "registeredAt"> & { id?: string },
): CreatorRecord {
  const store = memoryStore();
  const normalizedFeedUrl = normalizeFeedUrl(input.feedUrl);
  const id =
    input.id ??
    `creator-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48)}`;

  assertUniqueRegistration(store, id, normalizedFeedUrl);

  const record: CreatorRecord = {
    id,
    name: input.name,
    feedUrl: normalizedFeedUrl,
    wallet: input.wallet,
    splitBps: input.splitBps,
    registeredAt: new Date().toISOString(),
  };

  store.push(record);
  return record;
}

/** Persist to Supabase (call from API route after validation). */
export async function persistCreator(record: CreatorRecord): Promise<void> {
  const supabase = getServiceSupabase();
  if (!supabase) return;
  const { error } = await supabase.from("symbio_creators").upsert({
    id: record.id,
    name: record.name,
    feed_url: record.feedUrl,
    wallet: record.wallet,
    split_bps: record.splitBps,
    registered_at: record.registeredAt,
  });
  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "This content URL is already registered. Each piece or feed can only be claimed once.",
      );
    }
    throw new Error(error.message);
  }
}

export function getCollaborationSplit(): CreatorRecord[] {
  return listCreators().slice(0, 3);
}
