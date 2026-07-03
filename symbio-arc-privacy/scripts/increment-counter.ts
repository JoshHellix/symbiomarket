/**
 * Phase 1c: Encrypt → increment FHECounter on Sepolia → decrypt result.
 *
 * Requires FHE_COUNTER_ADDRESS and FHE_PRIVATE_KEY in .env
 * Run: npm run increment:sepolia
 */

import hre, { ethers } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";

const INCREMENT_BY = 1;

async function main() {
  const address = process.env.FHE_COUNTER_ADDRESS?.trim();
  if (!address) {
    throw new Error("Set FHE_COUNTER_ADDRESS in fhe-contracts/.env");
  }

  const [signer] = await ethers.getSigners();
  console.log("Signer:", signer.address);
  console.log("Contract:", address);

  // Required for `hardhat run` (tests initialize automatically).
  console.log("Initializing FHEVM plugin (relayer + coprocessor)...");
  await hre.fhevm.initializeCLIApi();

  const counter = await ethers.getContractAt("FHECounter", address);
  await hre.fhevm.assertCoprocessorInitialized(counter, "FHECounter");

  console.log(`Encrypting +${INCREMENT_BY} (euint32)...`);
  const input = hre.fhevm.createEncryptedInput(address, signer.address);
  input.add32(INCREMENT_BY);
  const encrypted = await input.encrypt();

  console.log("Sending increment tx...");
  const tx = await counter.increment(encrypted.handles[0], encrypted.inputProof);
  const receipt = await tx.wait();
  console.log("Tx:", receipt?.hash);

  const encryptedCount = await counter.getCount();
  console.log("Decrypting on-chain counter...");
  const clear = await hre.fhevm.userDecryptEuint(
    FhevmType.euint32,
    encryptedCount,
    address,
    signer,
  );

  console.log("\nDecrypted counter value:", clear.toString());
  console.log(
    "View on Sepolia:",
    `https://sepolia.etherscan.io/address/${address}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
