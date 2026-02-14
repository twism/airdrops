import {
  createPublicClient,
  http,
  type Hex,
  type PublicClient,
  type Chain as ViemChain,
} from "viem";
import { mainnet, base, polygon, arbitrum, optimism } from "viem/chains";
import type { Chain } from "@/lib/types";

/**
 * Standard MerkleDistributor ABI — covers most airdrop contracts.
 * Common functions:
 *   isClaimed(uint256 index) → bool
 *   merkleRoot() → bytes32
 */
export const DISTRIBUTOR_ABI = [
  {
    name: "isClaimed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "merkleRoot",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
] as const;

const VIEM_CHAINS: Partial<Record<Chain, ViemChain>> = {
  ethereum: mainnet,
  base,
  polygon,
  arbitrum,
  optimism,
};

/**
 * Get a viem public client for a given chain.
 * Uses env-provided RPC URLs when available, otherwise falls back to
 * viem's default public RPCs.
 */
export function getClient(chain: Chain): PublicClient {
  const viemChain = VIEM_CHAINS[chain];
  if (!viemChain) {
    throw new Error(`No EVM chain config for: ${chain}`);
  }

  // Allow per-chain RPC override via env, e.g. RPC_URL_ETHEREUM
  const envKey = `RPC_URL_${chain.toUpperCase()}`;
  const rpcUrl = process.env[envKey];

  return createPublicClient({
    chain: viemChain,
    transport: http(rpcUrl || undefined),
  });
}

/**
 * Check if a claim index has already been claimed on a distributor contract.
 */
export async function isClaimed(
  chain: Chain,
  contractAddress: Hex,
  index: bigint
): Promise<boolean> {
  const client = getClient(chain);
  const result = await client.readContract({
    address: contractAddress,
    abi: DISTRIBUTOR_ABI,
    functionName: "isClaimed",
    args: [index],
  });
  return result as boolean;
}

/**
 * Read the merkle root from a distributor contract.
 */
export async function readMerkleRoot(
  chain: Chain,
  contractAddress: Hex
): Promise<Hex> {
  const client = getClient(chain);
  const result = await client.readContract({
    address: contractAddress,
    abi: DISTRIBUTOR_ABI,
    functionName: "merkleRoot",
  });
  return result as Hex;
}
