import { NextRequest, NextResponse } from "next/server";

import { withGateway } from "@/lib/x402";

import { listCreatorsAsync } from "@/lib/settlement/registry";

import { resolveCreatorsForSource, toPayeeSplits } from "@/lib/settlement/resolve";



const handler = async (req: NextRequest) => {

  const source =

    req.nextUrl.searchParams.get("source") ??

    "https://example.com/article/demo";



  const registry = await listCreatorsAsync();

  const matched = resolveCreatorsForSource(source, registry);

  const payees = toPayeeSplits(matched.length > 0 ? matched : registry.slice(0, 1));



  return NextResponse.json({

    type: "citation_unlock",

    source,

    matchedCreators: matched.map((c) => c.id),

    excerpt: `Attribution unlock for ${source}. Micropayment recorded; cite this URL in generated content.`,

    payees,

    priceUsd: "0.001",

    settledOn: "arc-testnet",

    timestamp: new Date().toISOString(),

  });

};



export const GET = withGateway(handler, "$0.001", "/api/premium/citation");


