"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Reveal } from "@/components/marketing/reveal";

type RegisteredAgent = {
  id: string;
  name: string;
  agentEndpoint: string;
  operatorWallet: string;
};

export default function RegisterAgentPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    agentEndpoint: "",
    operatorWallet: "",
    contact: "",
  });
  const [registered, setRegistered] = useState<RegisteredAgent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/settlement/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setRegistered({
        id: data.agent.id,
        name: formData.name,
        agentEndpoint: formData.agentEndpoint,
        operatorWallet: formData.operatorWallet,
      });
      setFormData({
        name: "",
        description: "",
        agentEndpoint: "",
        operatorWallet: "",
        contact: "",
      });
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
                  <h1 className="font-display text-4xl font-bold text-foreground">
                    Register your agent
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    List the operator wallet and endpoint for your citation-paying client.
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
                      Agent name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="My Research Bot"
                      required
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-foreground"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="What sources does your agent cite? Which stack?"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="agentEndpoint"
                      className="block text-sm font-medium text-foreground"
                    >
                      Agent endpoint URL
                    </label>
                    <input
                      type="url"
                      id="agentEndpoint"
                      name="agentEndpoint"
                      value={formData.agentEndpoint}
                      onChange={handleChange}
                      placeholder="https://your-agent.example.com"
                      required
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="operatorWallet"
                      className="block text-sm font-medium text-foreground"
                    >
                      Operator wallet (Arc testnet)
                    </label>
                    <input
                      type="text"
                      id="operatorWallet"
                      name="operatorWallet"
                      value={formData.operatorWallet}
                      onChange={handleChange}
                      placeholder="0x..."
                      required
                      pattern="^0x[a-fA-F0-9]{40}$"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact" className="block text-sm font-medium text-foreground">
                      Contact (optional)
                    </label>
                    <input
                      type="text"
                      id="contact"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      placeholder="email or @handle"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-glow w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {loading ? "Registering…" : "Register agent"}
                  </button>
                </form>
              </Reveal>
            </div>
          ) : (
            <Reveal onMount>
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-display text-4xl font-bold text-foreground">
                  Agent registered!
                </h1>
                <div className="hover-lift space-y-4 rounded-lg border border-border bg-card p-8 text-left">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">ID</p>
                    <p className="font-mono text-sm text-foreground">{registered.id}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Name</p>
                    <p className="font-mono text-sm text-foreground">{registered.name}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Endpoint
                    </p>
                    <p className="break-all font-mono text-sm text-foreground">
                      {registered.agentEndpoint}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Wallet</p>
                    <p className="font-mono text-sm text-foreground">{registered.operatorWallet}</p>
                  </div>
                </div>
                <Link href="/agents" className="text-sm font-medium text-primary hover:opacity-80">
                  View agent registry →
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}
