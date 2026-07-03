import { NextRequest, NextResponse } from "next/server";
import { listCreatorsAsync } from "@/lib/settlement/registry";
import { resolveCreatorsForSource, toPayeeSplits } from "@/lib/settlement/resolve";

/** Free lookup: which creators would be paid for a citation source URL. */
export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get("source");
  if (!source?.trim()) {
    return NextResponse.json({ error: "source query param required" }, { status: 400 });
  }

  const registry = await listCreatorsAsync();
  const matched = resolveCreatorsForSource(source, registry);

  return NextResponse.json({
    source,
    matched: matched.map((c) => ({
      id: c.id,
      name: c.name,
      feedUrl: c.feedUrl,
      wallet: c.wallet,
      splitBps: c.splitBps,
    })),
    payees: toPayeeSplits(matched),
    citationEndpoint: `/api/premium/citation?source=${encodeURIComponent(source)}`,
    priceUsd: "0.001",
  });
}
