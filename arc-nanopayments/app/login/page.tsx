"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { login } from "../actions";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Reveal } from "@/components/marketing/reveal";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <MarketingShell>
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <Reveal onMount className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                <Lock className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Operator Login</h1>
            <p className="text-sm text-muted-foreground">Access the payment dashboard</p>
          </div>

          <form action={handleSubmit} className="hover-lift space-y-4 rounded-lg border border-border bg-card p-8">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={pending}
              className="mt-2 w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="text-center">
            <Link href="/" className="text-sm text-primary hover:opacity-80">
              ← Back to home
            </Link>
          </div>
        </Reveal>
      </div>
    </MarketingShell>
  );
}
