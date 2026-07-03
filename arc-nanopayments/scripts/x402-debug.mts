/** Debug x402 — prints verify failure reason from server */
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

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const buyerKey = process.env.BUYER_PRIVATE_KEY as `0x${string}`;
const url = `${BASE_URL}/api/premium/quote`;
const ARC_USDC = "0x3600000000000000000000000000000000000000" as const;

const funder = privateKeyToAccount(buyerKey);
const ephemeralKey = generatePrivateKey();
const ephemeral = privateKeyToAccount(ephemeralKey);
const rpc = http("https://rpc.testnet.arc.network");
const publicClient = createPublicClient({ chain: arcTestnet, transport: rpc });
const funderWallet = createWalletClient({ account: funder, chain: arcTestnet, transport: rpc });

await funderWallet.sendTransaction({ to: ephemeral.address, value: parseEther("0.01") });
const usdcHash = await funderWallet.writeContract({
  address: ARC_USDC,
  abi: erc20Abi,
  functionName: "transfer",
  args: [ephemeral.address, parseUnits("0.2", 6)],
});
await publicClient.waitForTransactionReceipt({ hash: usdcHash });

const gateway = new GatewayClient({ chain: "arcTestnet", privateKey: ephemeralKey });
await gateway.deposit("0.2");

const r1 = await fetch(url);
const pr = r1.headers.get("PAYMENT-REQUIRED");
console.log("402 status", r1.status, "has header", Boolean(pr));
if (pr) {
  const decoded = JSON.parse(Buffer.from(pr, "base64").toString("utf-8"));
  console.log("accepts[0]", JSON.stringify(decoded.accepts?.[0], null, 2));
}

try {
  const result = await gateway.pay(url);
  console.log("SUCCESS", result.formattedAmount);
} catch (e) {
  console.error("pay error:", (e as Error).message);
  // manual second attempt to read reason
  const r402 = await fetch(url);
  const header = r402.headers.get("PAYMENT-REQUIRED");
  if (!header) throw e;
  const paymentRequired = JSON.parse(Buffer.from(header, "base64").toString("utf-8"));
  const expectedNetwork = `eip155:${arcTestnet.id}`;
  const batchingOption = paymentRequired.accepts.find(
    (opt: { network: string; extra?: { name?: string } }) =>
      opt.network === expectedNetwork && opt.extra?.name === "GatewayWalletBatched",
  );
  const paymentPayload = await gateway.createPaymentPayload(
    paymentRequired.x402Version ?? 2,
    batchingOption,
  );
  const paymentHeader = Buffer.from(
    JSON.stringify({
      ...paymentPayload,
      resource: paymentRequired.resource,
      accepted: batchingOption,
    }),
  ).toString("base64");
  const paid = await fetch(url, { headers: { "Payment-Signature": paymentHeader } });
  const body = await paid.json();
  console.log("paid status", paid.status, "body", JSON.stringify(body, null, 2));
}
