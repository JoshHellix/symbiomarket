import { NextRequest, NextResponse } from "next/server";
import { listAgentsAsync, registerAgentAsync } from "@/lib/settlement/agent-registry";

export async function GET() {
  const agents = await listAgentsAsync();
  return NextResponse.json({
    service: "SymbioMarket Agent Registry",
    description:
      "Register agent operators who run citation-paying clients. Public read; writes via API or /register-agent.",
    register_page: "/register-agent",
    agents,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name?: string;
      description?: string;
      operatorWallet?: string;
      agentEndpoint?: string;
      contact?: string;
      id?: string;
    };

    if (!body.name?.trim() || !body.operatorWallet?.trim() || !body.agentEndpoint?.trim()) {
      return NextResponse.json(
        { error: "name, operatorWallet, and agentEndpoint are required" },
        { status: 400 },
      );
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(body.operatorWallet)) {
      return NextResponse.json(
        { error: "operatorWallet must be a valid 0x address" },
        { status: 400 },
      );
    }

    try {
      new URL(body.agentEndpoint.trim());
    } catch {
      return NextResponse.json({ error: "agentEndpoint must be a valid URL" }, { status: 400 });
    }

    const agent = await registerAgentAsync({
      id: body.id,
      name: body.name.trim(),
      description: body.description?.trim() ?? "",
      operatorWallet: body.operatorWallet as `0x${string}`,
      agentEndpoint: body.agentEndpoint.trim(),
      contact: body.contact?.trim() ?? "",
    });

    return NextResponse.json({ ok: true, agent }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
