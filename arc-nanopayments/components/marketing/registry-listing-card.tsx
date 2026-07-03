"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  CITATION_USDC,
  estMonthly,
  feedKind,
  type RegistryCreator,
} from "@/lib/marketing/registry";
import { cn } from "@/lib/utils";

type Props = {
  creator: RegistryCreator;
  className?: string;
  compact?: boolean;
};

export function RegistryListingCard({ creator, className, compact }: Props) {
  const kind = feedKind(creator.feedUrl);

  return (
    <article
      className={cn(
        "hover-lift group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 motion-safe:transition-all motion-safe:duration-300 sm:flex-row sm:items-start sm:justify-between sm:hover:border-primary/20",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {kind}
          </span>
          {creator.registeredAt && (
            <span className="text-xs text-muted-foreground">
              Joined {new Date(creator.registeredAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary motion-safe:transition-colors">
            {creator.name}
          </h3>
          <a
            href={creator.feedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-start gap-1.5 break-all text-sm text-primary hover:opacity-80"
          >
            <span className="line-clamp-2">{creator.feedUrl}</span>
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          </a>
        </div>
        {!compact && (
          <p className="font-mono text-xs text-muted-foreground">
            {creator.wallet.slice(0, 8)}…{creator.wallet.slice(-6)}
          </p>
        )}
      </div>

      <div className="shrink-0 border-t border-border pt-3 sm:border-t-0 sm:border-l sm:pl-5 sm:pt-0 sm:text-right">
        <p className="text-2xl font-bold tabular-nums text-foreground">
          ${CITATION_USDC.toFixed(3)}
        </p>
        <p className="text-xs text-muted-foreground">per citation</p>
        <p className="mt-2 text-xs text-muted-foreground">
          ~${estMonthly(1000)}/mo at 1k cites
        </p>
      </div>
    </article>
  );
}

export function EmptyRegistryCard() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
      <p className="text-lg font-semibold text-foreground">No creators registered yet</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Be the first creator in the open registry — articles, photos, music, and video.
      </p>
      <Link
        href="/register"
        className="btn-glow hover-lift mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Register your feed
      </Link>
    </div>
  );
}
