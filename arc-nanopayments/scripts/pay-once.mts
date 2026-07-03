/**
 * Non-interactive x402 smoke test — N payments then exit.
 * Run: npm run pay-once
 */
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

const count = Number(process.env.PAY_COUNT ?? "5");
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const buyerKey = process.env.BUYER_PRIVATE_KEY as `0x${string}` | undefined;

if (!buyerKey) {
  console.error("Missing BUYER_PRIVATE_KEY in .env.local");
  process.exit(1);
}

const ARC_TESTNET_USDC = "0x3600000000000000000000000000000000000000" as const;
const ARC_TESTNET_RPC = "https://rpc.testnet.arc.network";
const DEPOSIT_AMOUNT = process.env.DEPOSIT_AMOUNT ?? "0.2";
const GAS_FUND_AMOUNT = parseEther("0.01");

const endpoints = [
  `${BASE_URL}/api/premium/quote`,
  `${BASE_URL}/api/premium/citation?source=https://symbiomarket.vercel.app/feeds/demo`,
  `${BASE_URL}/api/premium/dataset`,
  `${BASE_URL}/api/premium/agent-task`,
];

const funderAccount = privateKeyToAccount(buyerKey);
const ephemeralKey = generatePrivateKey();
const ephemeralAccount = privateKeyToAccount(ephemeralKey);

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(ARC_TESTNET_RPC),
});
const funderWallet = createWalletClient({
  account: funderAccount,
  chain: arcTestnet,
  transport: http(ARC_TESTNET_RPC),
});

console.log(`Funder: ${funderAccount.address}`);
console.log(`Ephemeral buyer: ${ephemeralAccount.address}`);

const gasTxHash = await funderWallet.sendTransaction({
  to: ephemeralAccount.address,
  value: GAS_FUND_AMOUNT,
});
await publicClient.waitForTransactionReceipt({ hash: gasTxHash });

const usdcAmount = parseUnits(DEPOSIT_AMOUNT, 6);
const usdcTxHash = await funderWallet.writeContract({
  address: ARC_TESTNET_USDC,
  abi: erc20Abi,
  functionName: "transfer",
  args: [ephemeralAccount.address, usdcAmount],
});
await publicClient.waitForTransactionReceipt({ hash: usdcTxHash });

const gateway = new GatewayClient({
  chain: "arcTestnet",
  privateKey: ephemeralKey,
});

const deposit = await gateway.deposit(DEPOSIT_AMOUNT);
console.log(`Gateway deposit tx: ${deposit.depositTxHash}`);

let ok = 0;
let fail = 0;
let total = 0;

for (let i = 0; i < count; i++) {
  const url = endpoints[i % endpoints.length];
  const label = url.split("/").pop() ?? url;
  try {
    const result = await gateway.pay(url, { method: "GET" });
    const amount = parseFloat(result.formattedAmount);
    total += amount;
    ok++;
    console.log(
      `[ok] ${i + 1}/${count} ${label} -> ${result.formattedAmount} USDC`,
    );
  } catch (err) {
    fail++;
    const msg = (err as Error).message;
    console.error(`[fail] ${i + 1}/${count} ${label}: ${msg}`);
  }
}

console.log(`\nDone: ${ok} ok, ${fail} fail, ~${total.toFixed(6)} USDC spent`);
process.exit(fail > 0 ? 1 : 0);
