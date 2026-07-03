import { ethers } from "hardhat";

async function main() {
  const rpc =
    process.env.FHEVM_SEPOLIA_RPC_URL?.trim() || "https://sepolia.drpc.org";
  console.log("RPC:", rpc);

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No deployer account. Set FHE_PRIVATE_KEY in fhe-contracts/.env (wallet with Sepolia ETH).",
    );
  }

  console.log("Deployer:", deployer.address);
  const bal = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(bal), "ETH");

  const factory = await ethers.getContractFactory("FHECounter");
  const counter = await factory.deploy();
  await counter.waitForDeployment();
  const address = await counter.getAddress();

  console.log("\nFHECounter deployed:", address);
  console.log("\nAdd to arc-nanopayments/.env.local (Phase 1b):");
  console.log(`FHE_COUNTER_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
