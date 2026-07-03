"use client";

import Link from "next/link";
import { ArrowUpRight, Radio } from "lucide-react";
import { useSwarmState } from "@/hooks/use-swarm-state";
import { cn } from "@/lib/utils";

const ARC_EXPLORER = "https://testnet.arcscan.app";

function arcTxUrl(hash: string) {
  return `${ARC_EXPLORER}/tx/${hash}`;
}

function arcAddressUrl(address: string) {
  return `${ARC_EXPLORER}/address/${address}`;
}

function isArcTxHash(value: string) {
  return value.startsWith("0x") && value.length >= 42;
}

export function LivePaymentTicker() {
  const { state, loading, error } = useSwarmState(5000);
  const payments = state?.payments?.slice(0, 5) ?? [];
  const liveTotal = state?.settlement?.live_usdc_total ?? 0;
  const cycle = state?.cycle ?? 0;
  const isLive = cycle > 0 && !error;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "relative flex h-2.5 w-2.5",
              isLive ? "text-emerald-500" : "text-muted-foreground",
            )}
          >
            {isLive && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            )}
            <span
              className={cn(
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                isLive ? "bg-emerald-500" : "bg-muted-foreground/50",
              )}
            />
          </span>
          <span className="text-sm font-medium text-foreground">
            {isLive ? "Live settlement feed" : "Settlement feed"}
          </span>
        </div>
        <Link
          href="/swarm"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80"
        >
          Open demo
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border border-b border-border text-center">
        <div className="px-3 py-3">
          <p className="text-lg font-bold tabular-nums text-foreground">{cycle || "—"}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Cycles</p>
        </div>
        <div className="px-3 py-3">
          <p className="text-lg font-bold tabular-nums text-foreground">
            {payments.length || "—"}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Recent tx</p>
        </div>
        <div className="px-3 py-3">
          <p className="text-lg font-bold tabular-nums text-foreground">
            {liveTotal > 0 ? `$${liveTotal.toFixed(3)}` : "—"}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Live USDC</p>
        </div>
      </div>

      <div className="max-h-56 overflow-y-auto">
        {loading && payments.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">Loading feed…</p>
        ) : payments.length === 0 ? (
          <div className="space-y-2 px-4 py-6 text-center">
            <Radio className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Start <code className="text-xs">python swarm_api.py</code> to stream payments here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {payments.map((p, i) => {
              const gatewayTx = p.gateway_tx?.trim();
              const arcTx = gatewayTx && isArcTxHash(gatewayTx) ? gatewayTx : null;
              const payer = p.payer?.startsWith("0x") ? p.payer : null;
              return (
                <li
                  key={`${p.time}-${i}`}
                  className="motion-safe:animate-in fade-in slide-in-from-right-2 px-4 py-3 text-sm duration-500"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{p.purpose || p.endpoint || "Citation"}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.mode === "live" ? "Confirmed" : p.mode || "mesh"} · {p.time}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-xs font-semibold text-primary">
                      ${Number(p.amount).toFixed(4)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    {arcTx && (
                      <a
                        href={arcTxUrl(arcTx)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View on Arc →
                      </a>
                    )}
                    {!arcTx && payer && p.mode === "live" && (
                      <a
                        href={arcAddressUrl(payer)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View payer on Arc →
                      </a>
                    )}
                    {gatewayTx && !arcTx && (
                      <span
                        className="text-xs text-muted-foreground"
                        title={`Circle Gateway settlement: ${gatewayTx}`}
                      >
                        Gateway ref {gatewayTx.slice(0, 8)}…
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
