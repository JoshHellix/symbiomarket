/**
 * Types for the SymbioMarket neon dashboard (symbiomarket-dashboard).
 */

export type AgentName = "Oracle" | "Strategist" | "Executor" | "Evaluator";
export type AgentStatus = "ACTIVE" | "PROCESSING" | "IDLE" | "SYNCING";

export interface Agent {
  name: AgentName;
  status: AgentStatus;
  role: string;
  uptime: string;
  tasksCompleted: number;
  accuracy: number;
  latency: number;
}

export interface Transaction {
  id: string;
  from: AgentName;
  to: string;
  amount: number;
  purpose: string;
  timestamp: Date;
  status: "confirmed" | "pending" | "failed";
  mode?: string;
  gatewayTx?: string | null;
}

export interface CycleData {
  cycle: number;
  profit: number;
  trades: number;
  agents: number;
  timestamp: Date;
}

export const AGENT_ROLES: Record<AgentName, string> = {
  Oracle: "DATA_AGGREGATOR",
  Strategist: "SIGNAL_PROCESSOR",
  Executor: "TRADE_EXECUTOR",
  Evaluator: "RISK_ASSESSOR",
};
