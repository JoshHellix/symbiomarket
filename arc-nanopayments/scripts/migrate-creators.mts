/**
 * Verify / apply symbio_creators table on Supabase.
 * Run: npm run migrate:creators
 *
 * Applies migration when DATABASE_URL or SUPABASE_DB_URL is set (Settings → Database → URI).
 * Otherwise prints SQL for the Supabase SQL Editor.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const dbUrl = process.env.DATABASE_URL?.trim() ?? process.env.SUPABASE_DB_URL?.trim();

const sqlPath = join(process.cwd(), "supabase/migrations/20260311000000_symbio_creators.sql");
const sql = readFileSync(sqlPath, "utf-8");

async function applyWithPg(connectionString: string): Promise<boolean> {
  try {
    const pg = await import("pg");
    const client = new pg.default.Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();
    await client.query(sql);
    await client.end();
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Cannot find module 'pg'")) {
      console.error("Install pg first: npm install --save-dev pg");
    } else {
      console.error("PostgreSQL apply failed:", msg);
    }
    return false;
  }
}

async function main() {
  if (!url || !service) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const sb = createClient(url, service, { auth: { persistSession: false } });
  const { error } = await sb.from("symbio_creators").select("id").limit(1);

  if (!error) {
    console.log("[ok] symbio_creators exists and is reachable.");
    return;
  }

  if (error.code !== "PGRST205" && !error.message.includes("does not exist")) {
    console.error("Check failed:", error.message);
    process.exit(1);
  }

  console.log("symbio_creators not found — applying migration…");

  if (dbUrl) {
    const ok = await applyWithPg(dbUrl);
    if (ok) {
      const { error: recheck } = await sb.from("symbio_creators").select("id").limit(1);
      if (!recheck) {
        console.log("[ok] symbio_creators created via DATABASE_URL.");
        return;
      }
      console.error("Table still unreachable after SQL apply:", recheck.message);
      process.exit(1);
    }
  }

  const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  const editor = ref
    ? `https://supabase.com/dashboard/project/${ref}/sql/new`
    : "https://supabase.com/dashboard";

  console.error(`
Could not auto-apply (no DATABASE_URL / Supabase CLI login).

Option A — SQL Editor (30 seconds):
  1. Open ${editor}
  2. Paste and Run:

${sql}

Option B — CLI:
  npx supabase login
  npx supabase link --project-ref ${ref ?? "YOUR_REF"}
  npx supabase db push

Option C — add DATABASE_URL to .env.local (Settings → Database → URI), then re-run:
  npm run migrate:creators
`);
  process.exit(1);
}

main();
