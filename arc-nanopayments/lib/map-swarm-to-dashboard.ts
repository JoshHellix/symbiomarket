import type { SwarmCycle, SwarmPayment, SwarmState } from "@/hooks/use-swarm-state";
import type {
  Agent,
  AgentName,
  AgentStatus,
  CycleData,
  Transaction,
} from "@/lib/symbio-dashboard-types";
import { AGENT_ROLES } from "@/lib/symbio-dashboard-types";

const AGENT_NAMES: AgentName[] = ["Oracle", "Strategist", "Executor", "Evaluator"];

function asAgentName(s: string): AgentName {
  if (AGENT_NAMES.includes(s as AgentName)) return s as AgentName;
  return "Oracle";
}

function mapAgentStatus(raw?: string, cycle?: SwarmCycle, name?: AgentName): AgentStatus {
  const s = (raw ?? "active").toLowerCase();
  if (s === "thinking" || s === "processing") return "PROCESSING";
  if (s === "idle") return "IDLE";
  if (s === "syncing") return "SYNCING";
  if (cycle && name === "Oracle" && cycle.oracle.confidence > 0.7) return "ACTIVE";
  if (cycle && name === "Strategist" && cycle.strategist.decision !== "hold") return "PROCESSING";
  if (cycle && name === "Executor") return "ACTIVE";
  if (cycle && name === "Evaluator") return "SYNCING";
  return "ACTIVE";
}

function agentMetrics(name: AgentName, swarm: SwarmState, cycle: SwarmCycle | undefined) {
  const base = swarm.cycle * 10 + name.length * 100;
  if (!cycle) {
    return { tasksCompleted: base, accuracy: 94, latency: 20 };
  }
  switch (name) {
    case "Oracle":
      return {
        tasksCompleted: base + Math.round(cycle.oracle.confidence * 1000),
        accuracy: Math.min(99.9, 90 + cycle.oracle.confidence * 10),
        latency: 8 + Math.round(cycle.market.volatility * 100),
      };
    case "Strategist":
      return {
        tasksCompleted: base + Math.abs(cycle.strategist.bias) * 50,
        accuracy: Math.min(99, 88 + Math.abs(cycle.strategist.bias) * 5),
        latency: 18 + Math.abs(cycle.strategist.bias) * 5,
      };
    case "Executor":
      return {
        tasksCompleted: base + Math.round(Math.abs(cycle.executor.pnl) * 500),
        accuracy: 99.2,
        latency: 4,
      };
    case "Evaluator":
      return {
        tasksCompleted: base + Math.round((swarm.memory?.oracle_bias ?? 0) * 100),
        accuracy: Math.min(98, 90 + (swarm.memory?.risk_factor ?? 0.5) * 8),
        latency: 30 + Math.round((swarm.memory?.risk_factor ?? 0.5) * 20),
      };
  }
}

export function mapSwarmToAgents(swarm: SwarmState): Agent[] {
  const cycle = swarm.cycles[0];
  return AGENT_NAMES.map((name) => {
    const m = agentMetrics(name, swarm, cycle);
    return {
      name,
      status: mapAgentStatus(swarm.agents[name]?.status, cycle, name),
      role: AGENT_ROLES[name],
      uptime: `${(97 + (swarm.cycle % 3) * 0.7).toFixed(1)}%`,
      tasksCompleted: m.tasksCompleted,
      accuracy: parseFloat(m.accuracy.toFixed(1)),
      latency: m.latency,
    };
  });
}

export function mapSwarmToTransactions(swarm: SwarmState): Transaction[] {
  return swarm.payments.map((p: SwarmPayment, i: number) => {
    const live = p.mode === "live" && p.gateway_tx;
    return {
      id: p.tx_id ?? `TX-${String(swarm.cycle - i).padStart(6, "0")}`,
      from: asAgentName(p.from),
      to: p.to === "SettlementLayer" ? "Creators" : asAgentName(p.to),
      amount: parseFloat(Number(p.amount).toFixed(6)),
      purpose: p.purpose,
      timestamp: new Date(),
      status: live ? "confirmed" : p.mode === "failed" ? "failed" : "pending",
      mode: p.mode,
      gatewayTx: p.gateway_tx,
    };
  });
}

function paymentForCycle(swarm: SwarmState, cycleId: number) {
  const meshPrefix = `MESH-${String(cycleId).padStart(6, "0")}`;
  const meshHit = swarm.payments.find((p) => p.tx_id?.startsWith(meshPrefix));
  if (meshHit) return meshHit;
  const label = `TX-${String(cycleId).padStart(6, "0")}`;
  return swarm.payments.find((p) => p.tx_id === label);
}

export function mapSwarmToCycleHistory(swarm: SwarmState): CycleData[] {
  // Oldest → newest (left → right on chart)
  const rows = [...swarm.cycles].reverse();
  return rows.map((c) => {
    const payment = paymentForCycle(swarm, c.id);
    return {
      cycle: c.id,
      profit: c.executor.pnl,
      trades: payment ? 1 : 0,
      agents: 4,
      timestamp: new Date(),
    };
  });
}

export function swarmVolume(swarm: SwarmState): number {
  return parseFloat(
    swarm.payments.reduce((s, p) => s + p.amount, 0).toFixed(4),
  );
}

export function swarmProfit(swarm: SwarmState): number {
  return parseFloat(
    swarm.cycles.reduce((s, c) => s + c.executor.pnl, 0).toFixed(4),
  );
}

/** Arc block from FHE sync or synthetic from cycle */
export function swarmBlockHeight(swarm: SwarmState, arcBlock?: number): number {
  if (arcBlock) return arcBlock;
  return 44_300_000 + swarm.cycle;
}
