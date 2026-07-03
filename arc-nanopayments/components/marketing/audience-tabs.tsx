"use client";

import { cn } from "@/lib/utils";

type Tab = "creators" | "developers";

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

export function AudienceTabs({ active, onChange }: Props) {
  const tabs: { id: Tab; label: string; hint: string }[] = [
    { id: "creators", label: "I'm a creator", hint: "Per-piece payouts" },
    { id: "developers", label: "I'm building an agent", hint: "API & x402" },
  ];

  return (
    <div className="inline-flex rounded-xl border border-border bg-muted/50 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-lg px-4 py-2.5 text-left motion-safe:transition-all motion-safe:duration-200 sm:px-6",
            active === tab.id
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="block text-sm font-semibold">{tab.label}</span>
          <span className="hidden text-xs text-muted-foreground sm:block">{tab.hint}</span>
        </button>
      ))}
    </div>
  );
}
