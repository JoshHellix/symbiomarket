"use client";

import { useEffect, useState } from "react";

type Props = {
  /** Drop `public/hero-loop.mp4` (or .webm) after generating your loop */
  src?: string;
  poster?: string;
  className?: string;
};

export function HeroVideoBackground({
  src = "/hero-loop.mp4",
  poster,
  className = "",
}: Props) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(src, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setReady(res.ok);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!ready || failed) {
    return (
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.12),transparent_55%)]" />
        <div className="absolute -left-1/4 top-1/3 h-96 w-96 rounded-full bg-primary/5 blur-3xl motion-safe:animate-pulse" />
        <div className="absolute -right-1/4 bottom-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>
    );
  }

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={poster}
        className="h-full w-full object-cover opacity-[0.42] dark:opacity-[0.38]"
        onError={() => setFailed(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/55 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-transparent" />
    </div>
  );
}
