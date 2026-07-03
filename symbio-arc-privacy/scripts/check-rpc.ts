/**
 * Pick a working Sepolia RPC (helps when public endpoints time out).
 * Run: npx hardhat run scripts/check-rpc.ts
 */

import { ethers } from "ethers";

const CANDIDATES = [
  process.env.FHEVM_SEPOLIA_RPC_URL?.trim(),
  "https://sepolia.drpc.org",
  "https://1rpc.io/sepolia",
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://rpc.sepolia.org",
].filter(Boolean) as string[];

async function probe(url: string) {
  const provider = new ethers.JsonRpcProvider(url, 11155111, {
    staticNetwork: true,
    batchMaxCount: 1,
  });
  const start = Date.now();
  const block = await provider.getBlockNumber();
  return { url, block, ms: Date.now() - start };
}

async function main() {
  console.log("Testing Sepolia RPC endpoints...\n");
  for (const url of CANDIDATES) {
    try {
      const r = await probe(url);
      console.log(`OK  block ${r.block} (${r.ms}ms)`);
      console.log(`    ${r.url}\n`);
      console.log("Set in fhe-contracts/.env:");
      console.log(`FHEVM_SEPOLIA_RPC_URL=${r.url}`);
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`FAIL ${url}`);
      console.log(`     ${msg}\n`);
    }
  }
  console.error(
    "No RPC responded. Use Alchemy/Infura (free): create a Sepolia app, paste URL in .env as FHEVM_SEPOLIA_RPC_URL",
  );
  process.exitCode = 1;
}

main();
