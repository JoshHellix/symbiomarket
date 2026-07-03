/**
 * Quick check: local Supabase env + optional live /api/swarm/meta on Vercel.
 *
 *   npm run verify-supabase
 *   npm run verify-supabase -- --url https://symbiomarket.vercel.app
 */

const base =
  process.argv.find((a) => a.startsWith("--url="))?.slice(6) ??
  process.argv[process.argv.indexOf("--url") + 1] ??
  "";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

console.log("\nSymbioMarket — Supabase verify\n");

let ok = true;

function row(label: string, value: boolean, hint?: string) {
  const mark = value ? "OK" : "MISSING";
  console.log(`  [${mark}] ${label}${hint ? ` — ${hint}` : ""}`);
  if (!value) ok = false;
}

row("NEXT_PUBLIC_SUPABASE_URL", Boolean(url));
row("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", Boolean(anon));
row("SUPABASE_SERVICE_ROLE_KEY", Boolean(service), "required for ingest + /swarm remote state");

if (url && service) {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(url, service);
    const { error } = await sb.from("symbio_remote_state").select("key").limit(1);
    if (error) {
      console.log(`  [FAIL] symbio_remote_state — ${error.message}`);
      console.log("         Run SQL from docs/SUPABASE_FREE_SETUP.md Step 3");
      ok = false;
    } else {
      console.log("  [OK] symbio_remote_state table reachable");
    }
  } catch (e) {
    console.log(`  [FAIL] Supabase client — ${e instanceof Error ? e.message : e}`);
    ok = false;
  }
}

if (base) {
  const metaUrl = `${base.replace(/\/$/, "")}/api/swarm/meta`;
  try {
    const res = await fetch(metaUrl);
    const json = (await res.json()) as Record<string, unknown>;
    console.log(`\n  Live meta (${metaUrl}):`);
    console.log(`    storage: ${json.storage}`);
    console.log(`    ingestEnabled: ${json.ingestEnabled}`);
    if (json.storage !== "supabase") {
      console.log("    → Add Supabase env on Vercel and redeploy");
      ok = false;
    }
  } catch (e) {
    console.log(`  [FAIL] fetch meta — ${e instanceof Error ? e.message : e}`);
    ok = false;
  }
} else {
  console.log("\n  Tip: npm run verify-supabase -- --url https://symbiomarket.vercel.app");
}

console.log(ok ? "\nAll checks passed.\n" : "\nFix items above, then redeploy.\n");
process.exit(ok ? 0 : 1);
