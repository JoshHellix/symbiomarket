"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** ms */
  delay?: number;
  /** Run once when scrolled into view (default) or on mount */
  onMount?: boolean;
};

export function Reveal({ children, className, delay = 0, onMount = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(onMount);

  useEffect(() => {
    if (onMount) {
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onMount]);

  return (
    <div
      ref={ref}
      className={cn("motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out", className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function Stagger({
  children,
  className,
  staggerMs = 100,
}: {
  children: ReactNode[];
  className?: string;
  staggerMs?: number;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * staggerMs} onMount>
          {child}
        </Reveal>
      ))}
    </div>
  );
}
