"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AudienceTabs } from "@/components/marketing/audience-tabs";
import { CreatorMarketplace } from "@/components/marketing/creator-marketplace";
import { DeveloperPanel } from "@/components/marketing/developer-panel";
import { HeroVideoBackground } from "@/components/marketing/hero-video-background";
import { LivePaymentTicker } from "@/components/marketing/live-payment-ticker";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Reveal } from "@/components/marketing/reveal";
import { StatsStrip } from "@/components/marketing/stats-strip";
import { Rfb6UseCases } from "@/components/marketing/rfb6-use-cases";
import { CITATION_USDC } from "@/lib/marketing/registry";

export default function HomePage() {
  const [tab, setTab] = useState<"creators" | "developers">("creators");
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  return (
    <MarketingShell>
      {/* Hero — asymmetric, marketplace intent */}
      <section className="relative overflow-hidden border-b border-border bg-[hsl(40_20%_98%)] dark:bg-background">
        <HeroVideoBackground />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-20 lg:px-8">
          <div className="space-y-6">
            <Reveal onMount>
              <p className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                RFB #6 · Pay per piece · Arc testnet
              </p>
            </Reveal>
            <Reveal onMount delay={60}>
              <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
                Register your content.
                <span className="block text-primary">Get paid per piece.</span>
              </h1>
            </Reveal>
            <Reveal onMount delay={120}>
              <p className="max-w-lg text-lg text-muted-foreground">
                Articles, photos, songs, videos — when an agent or app cites your URL, they unlock
                attribution with a micro-payment (
                <strong className="text-foreground">${CITATION_USDC.toFixed(3)} USDC</strong> today),
                settled on Arc. No recurring subscription required.
              </p>
            </Reveal>
            <Reveal onMount delay={180}>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">→</span>
                  One-time signup: name, content URL, wallet
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">→</span>
                  Per-article, per-image, per-track — not monthly fees
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">→</span>
                  Agents pay via <code className="text-xs">?source=your-url</code>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">→</span>
                  Open registry — any builder can integrate
                </li>
              </ul>
            </Reveal>
            <Reveal onMount delay={240}>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/register"
                  className="btn-glow hover-lift inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Register your content
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/swarm"
                  className="hover-lift inline-flex items-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground"
                >
                  Watch live demo
                </Link>
                <Link
                  href="/register-agent"
                  className="hover-lift inline-flex items-center rounded-lg border border-dashed border-primary/40 bg-primary/5 px-6 py-3 text-sm font-medium text-primary"
                >
                  Register agent
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal onMount delay={120}>
            <LivePaymentTicker />
          </Reveal>
        </div>
      </section>

      <StatsStrip />

      <Rfb6UseCases />

      {/* Audience split — Phase B */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <Reveal>
            <AudienceTabs active={tab} onChange={setTab} />
          </Reveal>

          {tab === "creators" ? (
            <CreatorMarketplace />
          ) : (
            <Reveal>
              <DeveloperPanel baseUrl={baseUrl} />
            </Reveal>
          )}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-t border-border bg-muted/20 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            Settlement on{" "}
            <span className="font-medium text-foreground">Arc</span> · Powered by{" "}
            <span className="font-medium text-foreground">x402</span> · USDC micropayments
          </p>
          <div className="flex gap-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Arc testnet</span>
            <span>x402</span>
            <span>USDC</span>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
