"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Reveal } from "@/components/marketing/reveal";
import {
  AgentListingCard,
  EmptyAgentRegistryCard,
} from "@/components/marketing/agent-listing-card";
import type { AgentRecord } from "@/lib/settlement/types";

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settlement/agents", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setAgents((data.agents ?? []) as AgentRecord[]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MarketingShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal onMount>
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-display text-4xl font-bold text-foreground">Agent registry</h1>
                <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                  Operators who run clients that cite registered feeds and pay on Arc.
                </p>
              </div>
              <Link
                href="/register-agent"
                className="btn-glow hover-lift inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground"
              >
                Register your agent
              </Link>
            </div>
          </Reveal>

          {loading ? (
            <p className="mb-12 text-sm text-muted-foreground">Loading registry…</p>
          ) : agents.length === 0 ? (
            <Reveal delay={80}>
              <EmptyAgentRegistryCard />
            </Reveal>
          ) : (
            <div className="space-y-4">
              {agents.map((agent, i) => (
                <Reveal key={agent.id} delay={i * 60}>
                  <AgentListingCard agent={agent} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}
