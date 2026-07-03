"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    pathname === path
      ? "text-primary font-medium"
      : "text-muted-foreground hover:text-foreground";

  return (
    <header className="animate-header-in sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex shrink-0 flex-col leading-none transition motion-safe:duration-300 hover:opacity-90"
        >
          <span className="text-2xl font-black tracking-tight sm:text-3xl">
            <span className="text-foreground">Symbio</span>
            <span className="text-primary">Market</span>
          </span>
          <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]">
            Creator settlements on Arc · RFB #6
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/creators"
            className={`text-sm transition motion-safe:duration-200 ${linkClass("/creators")}`}
          >
            Creators
          </Link>
          <Link
            href="/agents"
            className={`text-sm transition motion-safe:duration-200 ${linkClass("/agents")}`}
          >
            Agents
          </Link>
          <Link
            href="/register"
            className={`text-sm transition motion-safe:duration-200 ${linkClass("/register")}`}
          >
            Register
          </Link>
          <Link
            href="/swarm"
            className={`text-sm transition motion-safe:duration-200 ${linkClass("/swarm")}`}
          >
            Live demo
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
