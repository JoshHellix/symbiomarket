"use client";

import { useEffect, useState } from "react";
import { filterRealCreators, CITATION_USDC, type RegistryCreator } from "@/lib/marketing/registry";
import { useSwarmState } from "@/hooks/use-swarm-state";

export function StatsStrip() {
  const [creatorCount, setCreatorCount] = useState<number | null>(null);
  const { state } = useSwarmState(8000);

  useEffect(() => {
    fetch("/api/settlement/creators", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const list = filterRealCreators((data.creators ?? []) as RegistryCreator[]);
        setCreatorCount(list.length);
      })
      .catch(() => setCreatorCount(0));
  }, []);

  const paymentCount = state?.payments?.length ?? 0;
  const liveUsdc = state?.settlement?.live_usdc_total ?? 0;

  const items = [
    {
      label: "Creators earning",
      value: creatorCount === null ? "…" : String(creatorCount),
    },
    {
      label: "Total settlements",
      value: paymentCount > 0 ? String(paymentCount) : "—",
    },
    {
      label: "Avg payment / piece",
      value: `$${CITATION_USDC.toFixed(3)}`,
    },
    {
      label: "Live USDC moved",
      value: liveUsdc > 0 ? `$${liveUsdc.toFixed(3)}` : "—",
    },
  ];

  return (
    <div className="border-y border-border bg-muted/30">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-border md:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={item.label}
            className="animate-fade-in-up bg-background px-4 py-4 text-center md:px-6"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <p className="text-lg font-bold tabular-nums text-foreground motion-safe:transition-colors motion-safe:duration-300">
              {item.value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
