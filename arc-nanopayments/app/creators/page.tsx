"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Reveal } from "@/components/marketing/reveal";
import {
  EmptyRegistryCard,
  RegistryListingCard,
} from "@/components/marketing/registry-listing-card";
import { DeveloperPanel } from "@/components/marketing/developer-panel";
import { filterRealCreators, type RegistryCreator } from "@/lib/marketing/registry";

export default function CreatorsPage() {
  const [creators, setCreators] = useState<RegistryCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [base, setBase] = useState("");

  useEffect(() => {
    setBase(window.location.origin);
    fetch("/api/settlement/creators", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setCreators(filterRealCreators((data.creators ?? []) as RegistryCreator[])))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MarketingShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal onMount>
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-display text-4xl font-bold text-foreground">Creator registry</h1>
                <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                  Pay-per-piece content on Arc — articles, photos, music, and video. One URL per
                  registration.
                </p>
              </div>
              <Link
                href="/register"
                className="btn-glow hover-lift inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground"
              >
                Register content
              </Link>
            </div>
          </Reveal>

          {loading ? (
            <p className="mb-12 text-sm text-muted-foreground">Loading registry…</p>
          ) : creators.length === 0 ? (
            <Reveal delay={80}>
              <EmptyRegistryCard />
            </Reveal>
          ) : (
            <div className="mb-16 space-y-4">
              {creators.map((creator, i) => (
                <Reveal key={creator.id} delay={i * 60}>
                  <RegistryListingCard creator={creator} />
                </Reveal>
              ))}
            </div>
          )}

          <Reveal delay={100}>
            <DeveloperPanel baseUrl={base} />
          </Reveal>
        </div>
      </section>
    </MarketingShell>
  );
}
