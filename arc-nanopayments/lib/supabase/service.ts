/**
 * Service-role Supabase client (server-only). Lazy — safe when Supabase env is unset (Vercel /swarm-only deploy).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { hasSupabaseServiceConfig } from "@/lib/supabase/config";

let client: SupabaseClient | null = null;

export function getServiceSupabase(): SupabaseClient | null {
  if (!hasSupabaseServiceConfig()) {
    return null;
  }
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return client;
}
