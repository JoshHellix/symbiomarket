/** Fund generated buyer wallet from legacy funder in repo root .env */
import fs from "fs";
import path from "path";
import {
  createPublicClient,
  createWalletClient,
  http,
  erc20Abi,
  parseUnits,
  parseEther,
} from "viem";
import { arcTestnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const ARC_USDC = "0x3600000000000000000000000000000000000000" as const;

function parseEnv(file: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const [k, ...rest] = t.split("=");
    out[k.trim()] = rest.join("=").trim();
  }
  return out;
}

const root = parseEnv(path.resolve("..", ".env"));
const local = parseEnv(path.resolve(".env.local"));
const funderKey = root.PRIVATE_KEY as `0x${string}`;
const buyer = local.BUYER_ADDRESS as `0x${string}`;
const amount = process.env.FUND_USDC ?? "2";

if (!funderKey?.startsWith("0x") || !buyer?.startsWith("0x")) {
  console.error("Missing funder PRIVATE_KEY or BUYER_ADDRESS");
  process.exit(1);
}

const funder = privateKeyToAccount(funderKey);
const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http("https://rpc.testnet.arc.network"),
});
const wallet = createWalletClient({
  account: funder,
  chain: arcTestnet,
  transport: http("https://rpc.testnet.arc.network"),
});

console.log(`Funding buyer ${buyer} with ${amount} USDC from ${funder.address}`);

const gasHash = await wallet.sendTransaction({
  to: buyer,
  value: parseEther("0.05"),
});
await publicClient.waitForTransactionReceipt({ hash: gasHash });
console.log(`Gas sent: ${gasHash}`);

const usdcHash = await wallet.writeContract({
  address: ARC_USDC,
  abi: erc20Abi,
  functionName: "transfer",
  args: [buyer, parseUnits(amount, 6)],
});
await publicClient.waitForTransactionReceipt({ hash: usdcHash });
console.log(`USDC sent: ${usdcHash}`);
