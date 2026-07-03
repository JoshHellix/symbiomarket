"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Reveal } from "@/components/marketing/reveal";

type RegisteredCreator = {
  id: string;
  name: string;
  feedUrl: string;
  wallet: string;
};

export default function RegisterCreatorPage() {
  const [formData, setFormData] = useState({ name: "", feedUrl: "", wallet: "" });
  const [registered, setRegistered] = useState<RegisteredCreator | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/settlement/creators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          feedUrl: formData.feedUrl,
          wallet: formData.wallet,
          splitBps: 10_000,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setRegistered({
        id: data.creator.id,
        name: formData.name,
        feedUrl: formData.feedUrl,
        wallet: formData.wallet,
      });
      setFormData({ name: "", feedUrl: "", wallet: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MarketingShell>
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {!registered ? (
            <div className="space-y-8">
              <Reveal onMount>
                <div className="space-y-4 text-center">
                  <h1 className="font-display text-4xl font-bold text-foreground">Register your content</h1>
                  <p className="text-lg text-muted-foreground">
                    Articles, photos, music, video — one URL, one wallet. Earn per unlock, not per
                    month.
                  </p>
                </div>
              </Reveal>

              <Reveal onMount delay={120}>
              <form
                onSubmit={handleSubmit}
                className="hover-lift space-y-6 rounded-lg border border-border bg-card p-8"
              >
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-foreground">
                    Display name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name or publication"
                    required
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="feedUrl" className="block text-sm font-medium text-foreground">
                    Content URL
                  </label>
                  <input
                    type="url"
                    id="feedUrl"
                    name="feedUrl"
                    value={formData.feedUrl}
                    onChange={handleChange}
                    placeholder="https://medium.com/@you/post · photo · track · video"
                    required
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    One URL per registration — duplicates are blocked. Use your article, image,
                    audio, or video link, or a site root for all pieces on that domain.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="wallet" className="block text-sm font-medium text-foreground">
                    Arc testnet wallet
                  </label>
                  <input
                    type="text"
                    id="wallet"
                    name="wallet"
                    value={formData.wallet}
                    onChange={handleChange}
                    placeholder="0x..."
                    required
                    pattern="0x[a-fA-F0-9]{40}"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    USDC payments go here. Need test USDC?{" "}
                    <a
                      href="https://faucet.circle.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:opacity-80"
                    >
                      Circle faucet
                    </a>
                  </p>
                </div>

                {error && (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-glow w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Registering…" : "Register"}
                </button>
              </form>
              </Reveal>

              <Reveal delay={80}>
              <div className="space-y-3 rounded-lg bg-secondary p-6">
                <h3 className="font-semibold text-foreground">What happens next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="mt-0.5 text-primary">→</span>
                    <span>Your registration is added to the public registry (Supabase)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 text-primary">→</span>
                    <span>
                      Agents look up your wallet via{" "}
                      <code className="rounded bg-background px-1 text-xs">?source=YOUR_URL</code>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 text-primary">→</span>
                    <span>Every citation triggers ~$0.001 USDC via x402</span>
                  </li>
                </ul>
              </div>
              </Reveal>
            </div>
          ) : (
            <div className="space-y-8 text-center">
              <Reveal onMount>
              <div className="flex justify-center">
                <div className="icon-float flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                  <Check className="h-8 w-8 text-accent-foreground" />
                </div>
              </div>
              </Reveal>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-foreground">You&apos;re registered!</h1>
                <p className="mx-auto max-w-lg text-lg text-muted-foreground">
                  Your feed is in the public registry. Agents can cite your content and pay you per use.
                </p>
              </div>
              <div className="space-y-4 rounded-lg border border-border bg-card p-8 text-left">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">ID:</p>
                  <p className="font-mono text-sm text-foreground">{registered.id}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Display name:</p>
                  <p className="font-mono text-sm text-foreground">{registered.name}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Feed URL:</p>
                  <p className="break-all font-mono text-sm text-foreground">{registered.feedUrl}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Wallet:</p>
                  <p className="font-mono text-sm text-foreground">{registered.wallet}</p>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/creators"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90"
                >
                  View registry
                </Link>
                <button
                  type="button"
                  onClick={() => setRegistered(null)}
                  className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 font-medium text-foreground transition hover:bg-secondary"
                >
                  Register another
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}
