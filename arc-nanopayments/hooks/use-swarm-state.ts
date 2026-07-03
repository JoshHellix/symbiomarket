/**
 * Copyright 2026 Circle Internet Group, Inc.  All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useCallback, useEffect, useState } from "react";

export type SwarmMarket = {
  price: number;
  volatility: number;
  trend: string;
};

export type SwarmCycle = {
  id: number;
  time: string;
  market: SwarmMarket;
  oracle: { signal: string; confidence: number };
  strategist: { decision: string; bias: number };
  executor: { pnl: number };
  evaluator: { oracle_bias: number; risk_factor: number };
};

export type SwarmPayment = {
  tx_id?: string;
  from: string;
  to: string;
  amount: number;
  purpose: string;
  time: string;
  fhe_status?: string;
  mode?: string;
  gateway_tx?: string | null;
  payer?: string;
  endpoint?: string;
};

export type SwarmMemory = {
  oracle_bias: number;
  risk_factor: number;
  learning_rate: number;
};

export type SwarmSettlement = {
  layer?: string;
  creators_api?: string;
  mode?: string;
  live_payments_total?: number;
  live_usdc_total?: number;
  x402_base?: string;
};

export type SwarmState = {
  cycle: number;
  updated_at?: string;
  market: SwarmMarket | null;
  agents: Record<string, { status?: string }>;
  memory?: SwarmMemory;
  cycles: SwarmCycle[];
  payments: SwarmPayment[];
  payment_mesh?: unknown[];
  settlement?: SwarmSettlement;
};

export function useSwarmState(pollMs = 3000) {
  const [state, setState] = useState<SwarmState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/swarm/state", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as SwarmState;
      setState(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "fetch failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pollMs);
    return () => clearInterval(id);
  }, [refresh, pollMs]);

  return { state, loading, error, refresh };
}
