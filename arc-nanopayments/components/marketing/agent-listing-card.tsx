"use client";

import { Bot, ExternalLink } from "lucide-react";
import type { AgentRecord } from "@/lib/settlement/types";

export function AgentListingCard({ agent }: { agent: AgentRecord }) {
  return (
    <article className="hover-lift group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 gap-4">
        <div className="icon-float flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Bot className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="truncate text-lg font-semibold text-foreground">{agent.name}</h3>
          {agent.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{agent.description}</p>
          )}
          <p className="truncate font-mono text-xs text-muted-foreground">{agent.agentEndpoint}</p>
          {agent.registeredAt && (
            <p className="text-xs text-muted-foreground">
              Joined {new Date(agent.registeredAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
        <p className="font-mono text-xs text-muted-foreground">
          {agent.operatorWallet.slice(0, 6)}…{agent.operatorWallet.slice(-4)}
        </p>
        <a
          href={agent.agentEndpoint}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80"
        >
          View agent
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </article>
  );
}

export function EmptyAgentRegistryCard() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
      <Bot className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
      <p className="mt-4 text-lg font-semibold text-foreground">No agents registered yet</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Run a citation-paying client? List it so creators know who integrates.
      </p>
      <a
        href="/register-agent"
        className="btn-glow hover-lift mt-6 inline-flex rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Register your agent
      </a>
    </div>
  );
}
