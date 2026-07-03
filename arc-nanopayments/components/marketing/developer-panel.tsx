"use client";

import Link from "next/link";

type Props = {
  baseUrl: string;
};

export function DeveloperPanel({ baseUrl }: Props) {
  const base = baseUrl || "https://arc-nanopayments-dun.vercel.app";

  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Integrate citation tolls</h2>
        <p className="text-muted-foreground">
          Agents and apps resolve a source URL to a creator wallet, then pay via x402 before
          grounding an answer. No SDK lock-in — plain HTTP + USDC on Arc.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DocBlock
          step="1"
          title="List registered creators"
          desc="Public registry — same data as the homepage cards."
          code={`GET ${base}/api/settlement/creators`}
        />
        <DocBlock
          step="2"
          title="Resolve source → wallet"
          desc="Free lookup. Match by URL prefix or hostname."
          code={`GET ${base}/api/settlement/resolve?source=YOUR_URL`}
        />
        <DocBlock
          step="3"
          title="Register a creator"
          desc="POST from your onboarding flow or use /register."
          code={`POST ${base}/api/settlement/creators
Content-Type: application/json

{ "name", "feedUrl", "wallet", "splitBps" }`}
        />
        <DocBlock
          step="4"
          title="List agent operators"
          desc="Who runs citation-paying clients — register at /register-agent."
          code={`GET ${base}/api/settlement/agents`}
        />
        <DocBlock
          step="5"
          title="Citation paywall (x402)"
          desc="HTTP 402 — ~$0.001 USDC on Arc testnet per unlock."
          code={`GET ${base}/api/premium/citation?source=CREATOR_URL`}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground">Example flow</h3>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-secondary p-4 font-mono text-xs leading-relaxed text-foreground">{`const source = "https://author.com/post/1";

// Who gets paid?
const { wallet } = await fetch(
  \`/api/settlement/resolve?source=\${encodeURIComponent(source)}\`
).then(r => r.json());

// Pay via x402 (~$0.001 USDC)
const res = await fetch(
  \`/api/premium/citation?source=\${encodeURIComponent(source)}\`
);
// 402 → complete payment → attribution in response`}</pre>
      </div>

      <p className="text-sm text-muted-foreground">
        Reference client:{" "}
        <Link href="/swarm" className="text-primary underline hover:opacity-80">
          live agent demo
        </Link>{" "}
        ·{" "}
        <Link href="/agents" className="text-primary underline hover:opacity-80">
          agent registry
        </Link>{" "}
        · Docs in repo: <code className="text-xs">settlement/README.md</code>
      </p>
    </div>
  );
}

function DocBlock({
  step,
  title,
  desc,
  code,
}: {
  step: string;
  title: string;
  desc: string;
  code: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">Step {step}</p>
      <h3 className="mt-1 font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-secondary p-3 font-mono text-xs text-foreground whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}
