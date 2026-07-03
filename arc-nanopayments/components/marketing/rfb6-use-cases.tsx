"use client";

import { FileText, Image, Music, Video } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { CITATION_USDC } from "@/lib/marketing/registry";

const USE_CASES = [
  {
    icon: FileText,
    label: "Articles & newsletters",
    example: "Pay $0.02 per read — not $10/month",
  },
  {
    icon: Image,
    label: "Photos & visuals",
    example: "License one image for $0.25, instant settlement",
  },
  {
    icon: Music,
    label: "Music & podcasts",
    example: "Pay per listen, not per subscription",
  },
  {
    icon: Video,
    label: "Video & clips",
    example: "Unlock a single piece for micropayment",
  },
] as const;

export function Rfb6UseCases() {
  return (
    <section className="border-b border-border bg-muted/15 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <Reveal>
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              RFB #6 · Pay per piece
            </p>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Subscriptions don&apos;t fit every creator.
            </h2>
            <p className="text-muted-foreground">
              Monetize one article, one photo, one song, or one video — with instant USDC on Arc.
              Tips, unbundled newsletters, co-author splits, and AI reading lists that auto-pay as
              you consume.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((item, i) => (
            <Reveal key={item.label} delay={i * 60}>
              <div className="hover-lift animate-fade-in-up group h-full rounded-xl border border-border bg-card p-5 motion-safe:transition-shadow motion-safe:duration-300 hover:border-primary/25 hover:shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-105">
                  <item.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-semibold text-foreground">{item.label}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{item.example}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="text-center text-xs text-muted-foreground">
            Citation toll today:{" "}
            <span className="font-medium text-foreground">${CITATION_USDC.toFixed(3)} USDC</span> per
            unlock · revenue splits via <code className="text-[11px]">splitBps</code> · open registry
          </p>
        </Reveal>
      </div>
    </section>
  );
}
