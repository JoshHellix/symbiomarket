import { NextRequest, NextResponse } from "next/server";
import { listCreatorsAsync, registerCreatorAsync } from "@/lib/settlement/registry";

export async function GET() {
  const creators = await listCreatorsAsync();
  return NextResponse.json({
    service: "SymbioMarket Settlement Layer",
    description:
      "Register creator content (articles, photos, music, video) and wallets for x402 micropayouts on Arc. One URL per piece — duplicates blocked.",
    register_page: "/register",
    creators,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name?: string;
      feedUrl?: string;
      wallet?: string;
      splitBps?: number;
      id?: string;
    };

    if (!body.name?.trim() || !body.feedUrl?.trim() || !body.wallet?.trim()) {
      return NextResponse.json(
        { error: "name, feedUrl, and wallet are required" },
        { status: 400 },
      );
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(body.wallet)) {
      return NextResponse.json(
        { error: "wallet must be a valid 0x address" },
        { status: 400 },
      );
    }

    const splitBps = body.splitBps ?? 10_000;
    if (splitBps < 1 || splitBps > 10_000) {
      return NextResponse.json(
        { error: "splitBps must be between 1 and 10000" },
        { status: 400 },
      );
    }

    const creator = await registerCreatorAsync({
      id: body.id,
      name: body.name.trim(),
      feedUrl: body.feedUrl.trim(),
      wallet: body.wallet as `0x${string}`,
      splitBps,
    });

    return NextResponse.json({ ok: true, creator }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
