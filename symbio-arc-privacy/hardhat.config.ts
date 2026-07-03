import "@nomicfoundation/hardhat-ethers";
import "@fhevm/hardhat-plugin";
import type { HardhatUserConfig } from "hardhat/config";
import dotenv from "dotenv";

dotenv.config();

function privateKey(): string[] {
  const raw = process.env.FHE_PRIVATE_KEY?.trim();
  if (!raw) return [];
  return [raw.startsWith("0x") ? raw : `0x${raw}`];
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: { enabled: true, runs: 800 },
      evmVersion: "cancun",
    },
  },
  networks: {
    sepolia: {
      url:
        process.env.FHEVM_SEPOLIA_RPC_URL?.trim() ||
        "https://sepolia.drpc.org",
      accounts: privateKey(),
      chainId: 11155111,
      timeout: 120_000,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
};

export default config;
