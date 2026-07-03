/**
 * Standalone: sync any payment JSON to Sepolia FHE ledger.
 * Env: PAYMENT_JSON (file path), SYNC_STATE_OUT (optional output path)
 */

import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import hre, { ethers } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";

const SCALE = 1_000_000;

type SwarmPayment = {
  from: string;
  to: string;
  amount: number;
  purpose: string;
  time?: string;
  tx_id?: string;
};

type PaymentFile = {
  cycle: number;
  payments: SwarmPayment[];
};

function amountToMicro(amount: number): number {
  const micro = Math.round(amount * SCALE);
  if (micro <= 0) return 1;
  if (micro > 4_000_000_000) throw new Error(`Amount too large: ${amount}`);
  return micro;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function retry<T>(label: string, fn: () => Promise<T>, attempts = 4): Promise<T> {
  let last: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      const msg = e instanceof Error ? e.message : String(e);
      const retryable =
        msg.includes("Bad JSON") ||
        msg.includes("Relayer") ||
        msg.includes("timeout") ||
        msg.includes("ECONNRESET") ||
        msg.includes("fetch failed");
      if (!retryable || i === attempts) break;
      await sleep(8000 * i);
    }
  }
  throw last;
}

async function main() {
  const ledgerAddress = process.env.FHE_COUNTER_ADDRESS?.trim();
  if (!ledgerAddress) throw new Error("Set FHE_COUNTER_ADDRESS in .env");

  const paymentPath =
    process.env.PAYMENT_JSON?.trim() ||
    join(process.cwd(), "examples", "sample-payment.json");

  const raw = await readFile(paymentPath, "utf-8");
  const data = JSON.parse(raw) as PaymentFile;
  const payment = data.payments[0];
  if (!payment) throw new Error("No payments[] in PAYMENT_JSON");

  const microAmount = amountToMicro(payment.amount);
  const txLabel = payment.tx_id ?? `TX-${String(data.cycle).padStart(6, "0")}`;

  console.log("Cycle:", data.cycle);
  console.log("Payment:", payment.from, "→", payment.to, `$${payment.amount}`);

  const [signer] = await ethers.getSigners();
  await retry("FHEVM init", () => hre.fhevm.initializeCLIApi());

  const counter = await ethers.getContractAt("FHECounter", ledgerAddress);
  await hre.fhevm.assertCoprocessorInitialized(counter, "FHECounter");

  const encrypted = await retry("Encrypt", async () => {
    const input = hre.fhevm.createEncryptedInput(ledgerAddress, signer.address);
    input.add32(microAmount);
    return input.encrypt();
  });

  const receipt = await retry("Sepolia tx", async () => {
    const tx = await counter.increment(encrypted.handles[0], encrypted.inputProof);
    return tx.wait();
  });

  const encryptedTotal = await counter.getCount();
  const clearMicro = await retry("Decrypt", () =>
    hre.fhevm.userDecryptEuint(FhevmType.euint32, encryptedTotal, ledgerAddress, signer),
  );

  const syncState = {
    cycle: data.cycle,
    updated_at: new Date().toISOString(),
    payment: { ...payment, tx_id: txLabel },
    fhe: {
      ledger_address: ledgerAddress,
      sepolia_tx: receipt?.hash ?? null,
      micro_added: microAmount,
      decrypted_total_usdc: Number(clearMicro) / SCALE,
      explorer_tx: receipt?.hash
        ? `https://sepolia.etherscan.io/tx/${receipt.hash}`
        : null,
    },
    arc: {
      status: "pending_public_settlement",
      note: "Run Arc settlement from SymbioMarket agents/arc_settle_swarm.py or your own script.",
    },
  };

  const out =
    process.env.SYNC_STATE_OUT?.trim() || join(process.cwd(), "sync-state.json");
  await writeFile(out, JSON.stringify(syncState, null, 2), "utf-8");
  console.log("Wrote", out);
  console.log("Sepolia tx:", receipt?.hash);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
