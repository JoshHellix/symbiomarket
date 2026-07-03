export type CreatorRecord = {
  id: string;
  name: string;
  feedUrl: string;
  wallet: `0x${string}`;
  /** Basis points of this payee's share in a route (10000 = 100%). */
  splitBps: number;
  registeredAt: string;
};

export type AgentRecord = {
  id: string;
  name: string;
  description: string;
  operatorWallet: `0x${string}`;
  agentEndpoint: string;
  contact: string;
  registeredAt: string;
};

export type CreatorSplit = {
  creatorId: string;
  name: string;
  wallet: `0x${string}`;
  splitBps: number;
};

export type PaymentIntent = {
  role: "Oracle" | "Strategist" | "Executor" | "Evaluator";
  endpoint: string;
  priceUsd: string;
  purpose: string;
  payees: CreatorSplit[];
};

/** Demo creators — replace wallets with real Arc testnet addresses as you register. */
export const DEFAULT_CREATORS: CreatorRecord[] = [
  {
    id: "creator-feed-alpha",
    name: "Feed Alpha (demo)",
    feedUrl: "https://symbiomarket.vercel.app/feeds/alpha",
    wallet: "0x0000000000000000000000000000000000000001",
    splitBps: 4000,
    registeredAt: "2026-06-15T00:00:00.000Z",
  },
  {
    id: "creator-feed-beta",
    name: "Feed Beta (demo)",
    feedUrl: "https://symbiomarket.vercel.app/feeds/beta",
    wallet: "0x0000000000000000000000000000000000000002",
    splitBps: 3500,
    registeredAt: "2026-06-15T00:00:00.000Z",
  },
  {
    id: "creator-feed-gamma",
    name: "Feed Gamma (demo)",
    feedUrl: "https://symbiomarket.vercel.app/feeds/gamma",
    wallet: "0x0000000000000000000000000000000000000003",
    splitBps: 2500,
    registeredAt: "2026-06-15T00:00:00.000Z",
  },
];

export const DEFAULT_AGENTS: AgentRecord[] = [
  {
    id: "agent-symbio-swarm",
    name: "Symbio Swarm (demo)",
    description: "Reference multi-agent client that cites registered feeds on Arc.",
    operatorWallet: "0xd9e7bcCfab3230AF31Dc250c7E91D82F4dAd91C5",
    agentEndpoint: "https://arc-nanopayments-dun.vercel.app/swarm",
    contact: "demo@symbiomarket.local",
    registeredAt: "2026-06-15T00:00:00.000Z",
  },
];
