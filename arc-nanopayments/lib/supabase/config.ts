/**
 * Copyright 2026 Circle Internet Group, Inc.  All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/** True when real Supabase URL + anon/publishable key are set (not .env.example placeholders). */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !key) return false;
  if (url.includes("your-project") || key.includes("your-publishable")) return false;

  return url.startsWith("http://") || url.startsWith("https://");
}

/** Server ingest / service routes — only URL + service role required. */
export function hasSupabaseServiceConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !service) return false;
  if (url.includes("your-project")) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}
