"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import {
  EmptyRegistryCard,
  RegistryListingCard,
} from "@/components/marketing/registry-listing-card";
import {
  CITATION_USDC,
  estMonthly,
  filterRealCreators,
  type RegistryCreator,
} from "@/lib/marketing/registry";

export function CreatorMarketplace() {
  const [creators, setCreators] = useState<RegistryCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [cites, setCites] = useState(500);

  useEffect(() => {
    fetch("/api/settlement/creators", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setCreators(filterRealCreators((data.creators ?? []) as RegistryCreator[])))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-10">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Open creator registry</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Pay-per-piece content agents can cite and pay — articles, photos, music, and video.
              Register once; earn per unlock.
            </p>
          </div>
          <Link
            href="/register"
            className="btn-glow hover-lift inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Register content
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading registry…</p>
      ) : creators.length === 0 ? (
        <Reveal delay={80}>
          <EmptyRegistryCard />
        </Reveal>
      ) : (
        <div className="space-y-4">
          {creators.slice(0, 6).map((creator, i) => (
            <Reveal key={creator.id} delay={i * 70}>
              <RegistryListingCard creator={creator} />
            </Reveal>
          ))}
          {creators.length > 6 && (
            <p className="text-center text-sm text-muted-foreground">
              +{creators.length - 6} more on{" "}
              <Link href="/creators" className="text-primary underline">
                full registry
              </Link>
            </p>
          )}
        </div>
      )}

      <Reveal delay={100}>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground">Estimate your earnings</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            At ${CITATION_USDC.toFixed(3)} USDC per unlock — pay-per-piece, not subscription.
          </p>
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                Citations / unlocks per month:{" "}
                <span className="tabular-nums text-primary">{cites.toLocaleString()}</span>
              </span>
              <input
                type="range"
                min={0}
                max={50000}
                step={100}
                value={cites}
                onChange={(e) => setCites(Number(e.target.value))}
                className="mt-3 w-full accent-primary"
              />
            </label>
            <p className="text-3xl font-bold tabular-nums text-foreground">
              ~${estMonthly(cites)}{" "}
              <span className="text-base font-normal text-muted-foreground">USDC / month</span>
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
