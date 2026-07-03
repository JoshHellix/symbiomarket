/**
 * Pay a batch of mesh intents (JSON file). One Gateway wallet, sequential x402 calls.
 * Usage: npm run pay-mesh -- path/to/intents.json
 * stdout: JSON array of results
 */
import fs from "fs";
import { GatewayClient } from "@circle-fin/x402-batching/client";
import {
  createPublicClient,
  createWalletClient,
  http,
  erc20Abi,
  parseUnits,
  parseEther,
} from "viem";
import { arcTestnet } from "viem/chains";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

type MeshIntent = {
  mesh_id: string;
  endpoint: string;
  skipped?: boolean;
};

type MeshResult = {
  mesh_id: string;
  ok: boolean;
  amount?: string;
  gateway_tx?: string;
  payer?: string;
  error?: string;
};

const meshPath = process.argv[2];
if (!meshPath || !fs.existsSync(meshPath)) {
  console.error(JSON.stringify({ error: "Usage: pay-mesh.mts <intents.json>" }));
  process.exit(1);
}

const intents = JSON.parse(fs.readFileSync(meshPath, "utf-8")) as MeshIntent[];
const payable = intents.filter((i) => !i.skipped);
const results: MeshResult[] = intents
  .filter((i) => i.skipped)
  .map((i) => ({ mesh_id: i.mesh_id, ok: false, error: "skipped" }));

if (payable.length === 0) {
  console.log(JSON.stringify(results));
  process.exit(0);
}

const buyerKey = process.env.BUYER_PRIVATE_KEY as `0x${string}` | undefined;
const baseUrl = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

if (!buyerKey) {
  console.error(JSON.stringify({ error: "Missing BUYER_PRIVATE_KEY" }));
  process.exit(1);
}

const ARC_USDC = "0x3600000000000000000000000000000000000000" as const;
const rpc = http("https://rpc.testnet.arc.network");
const funder = privateKeyToAccount(buyerKey);
const ephemeralKey = generatePrivateKey();
const ephemeral = privateKeyToAccount(ephemeralKey);
const publicClient = createPublicClient({ chain: arcTestnet, transport: rpc });
const funderWallet = createWalletClient({ account: funder, chain: arcTestnet, transport: rpc });

const depositAmount = process.env.DEPOSIT_AMOUNT ?? "0.5";
const usdcAmount = parseUnits(depositAmount, 6);

const gasHash = await funderWallet.sendTransaction({
  to: ephemeral.address,
  value: parseEther("0.01"),
});
await publicClient.waitForTransactionReceipt({ hash: gasHash });

const usdcHash = await funderWallet.writeContract({
  address: ARC_USDC,
  abi: erc20Abi,
  functionName: "transfer",
  args: [ephemeral.address, usdcAmount],
});
await publicClient.waitForTransactionReceipt({ hash: usdcHash });

const gateway = new GatewayClient({ chain: "arcTestnet", privateKey: ephemeralKey });
await gateway.deposit(depositAmount);

for (const intent of payable) {
  const path = intent.endpoint.startsWith("http")
    ? intent.endpoint
    : `${baseUrl}${intent.endpoint.startsWith("/") ? intent.endpoint : `/${intent.endpoint}`}`;

  try {
    const result = await gateway.pay(path, { method: "GET" });
    results.push({
      mesh_id: intent.mesh_id,
      ok: true,
      amount: result.formattedAmount,
      gateway_tx: result.transaction || undefined,
      payer: ephemeral.address,
    });
  } catch (err) {
    results.push({
      mesh_id: intent.mesh_id,
      ok: false,
      error: (err as Error).message,
    });
  }
}

console.log(JSON.stringify(results));
