/**
 * Copyright 2026 Circle Internet Group, Inc.  All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import Link from "next/link";
import { ConfidentialEconomyPanel } from "@/components/dashboard/confidential-economy-panel";
import { AgentGrid } from "@/components/symbio-dashboard/agent-card";
import { CycleChart } from "@/components/symbio-dashboard/cycle-chart";
import { DashboardHeader } from "@/components/symbio-dashboard/dashboard-header";
import { StatusBar } from "@/components/symbio-dashboard/status-bar";
import { SwarmTopology } from "@/components/symbio-dashboard/swarm-topology";
import { TransactionFeed } from "@/components/symbio-dashboard/transaction-feed";
import { useFheSync } from "@/hooks/use-fhe-sync";
import { useSwarmState } from "@/hooks/use-swarm-state";
import {
  mapSwarmToAgents,
  mapSwarmToCycleHistory,
  mapSwarmToTransactions,
  swarmBlockHeight,
  swarmProfit,
  swarmVolume,
} from "@/lib/map-swarm-to-dashboard";
import "@/styles/symbio-market.css";

type SymbioDashboardViewProps = {
  /** Full-screen /swarm vs embedded in Circle dashboard tab */
  embedded?: boolean;
};

export function SymbioDashboardView({ embedded = false }: SymbioDashboardViewProps) {
  const { state: swarm, loading, error } = useSwarmState(3000);
  const { state: fheState } = useFheSync(5000);

  const arcBlock = fheState?.arc?.block;

  if (loading && !swarm?.cycle) {
    return (
      <div className="symbio-dashboard flex h-[70vh] min-h-[480px] items-center justify-center font-mono antialiased">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--neon-green)] border-t-transparent" />
          <p className="text-xs uppercase tracking-widest text-neon-green neon-text-green animate-flicker">
            Initializing Swarm
          </p>
        </div>
      </div>
    );
  }

  if (!swarm || swarm.cycle === 0 || swarm.cycles.length === 0) {
    return (
      <div className="symbio-dashboard font-mono antialiased p-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 max-w-xl space-y-3">
          <p className="text-neon-green font-bold uppercase tracking-wider">No swarm data</p>
          <p className="text-sm text-muted-foreground">
            <strong>Local:</strong> run the Python swarm from repo root.{" "}
            <strong>Vercel:</strong> swarm runs on your machine and pushes state every cycle
            (<code className="text-neon-green/80">SWARM_INGEST_URL</code> in{" "}
            <code className="text-neon-green/80">.env</code>).
          </p>
          <pre className="text-xs border border-[var(--border)] rounded-md p-4 overflow-x-auto text-foreground">
            {`# WSL — local + optional Vercel push
cd /mnt/c/Users/dell/cursor-symbio/Symbiomarket
source venv/bin/activate
python3 agents/swarm_api.py

# .env (for live Vercel /swarm)
SWARM_INGEST_URL=https://YOUR_APP.vercel.app/api/swarm/ingest
SWARM_INGEST_SECRET=your-secret`}
          </pre>
          {error && (
            <p className="text-xs text-destructive">API: {error}</p>
          )}
        </div>
      </div>
    );
  }

  const agents = mapSwarmToAgents(swarm);
  const transactions = mapSwarmToTransactions(swarm);
  const cycleHistory = mapSwarmToCycleHistory(swarm);
  const totalVolume = swarmVolume(swarm);
  const totalProfit = swarmProfit(swarm);
  const blockHeight = swarmBlockHeight(swarm, arcBlock);

  const shellClass = embedded
    ? "symbio-dashboard font-mono antialiased rounded-xl border border-[var(--border)] overflow-hidden"
    : "symbio-dashboard flex h-screen flex-col overflow-hidden font-mono antialiased";

  return (
    <div className={shellClass}>
      <DashboardHeader
        cycle={swarm.cycle}
        totalVolume={totalVolume}
        totalProfit={totalProfit}
        live={!error}
        settlementMode={swarm.settlement?.mode}
        liveUsdcTotal={swarm.settlement?.live_usdc_total}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <AgentGrid agents={agents} />
            <SwarmTopology agents={agents} />
          </div>
          <div className="space-y-6 lg:col-span-7">
            <CycleChart data={cycleHistory} />
            <TransactionFeed transactions={transactions} />
          </div>
        </div>
        <div className="mt-6">
          <ConfidentialEconomyPanel />
        </div>
        {!embedded && (
          <p className="mt-4 text-center text-[10px] text-muted-foreground">
            Live swarm feed
            <span className="text-muted-foreground"> (local file or Vercel KV)</span>
            {" · "}
            <Link href="/register" className="text-neon-green hover:underline">
              Register creator feed →
            </Link>
            {" · "}
            <Link href="/" className="text-neon-green hover:underline">
              Circle USDC dashboard →
            </Link>
          </p>
        )}
      </main>
      <StatusBar
        blockHeight={blockHeight}
        agentCount={agents.filter((a) => a.status !== "IDLE").length}
        cycle={swarm.cycle}
      />
    </div>
  );
}
