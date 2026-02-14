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

// ---------------------------------------------------------------------------
// ERC-20 / ERC-721 helpers
// ---------------------------------------------------------------------------

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const ERC721_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/**
 * Read an ERC-20 token balance. Returns raw wei/smallest-unit bigint.
 */
export async function erc20Balance(
  chain: Chain,
  tokenAddress: Hex,
  account: Hex
): Promise<bigint> {
  const client = getClient(chain);
  return (await client.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [account],
  })) as bigint;
}

/**
 * Read an ERC-721 NFT balance (how many NFTs the address owns).
 */
export async function erc721Balance(
  chain: Chain,
  nftAddress: Hex,
  account: Hex
): Promise<bigint> {
  const client = getClient(chain);
  return (await client.readContract({
    address: nftAddress,
    abi: ERC721_ABI,
    functionName: "balanceOf",
    args: [account],
  })) as bigint;
}

/**
 * Get the native token balance (ETH/MATIC/etc.) for an address.
 */
export async function nativeBalance(
  chain: Chain,
  account: Hex
): Promise<bigint> {
  const client = getClient(chain);
  return client.getBalance({ address: account });
}

/**
 * Get the transaction count (nonce) — a proxy for on-chain activity.
 */
export async function txCount(
  chain: Chain,
  account: Hex
): Promise<number> {
  const client = getClient(chain);
  return client.getTransactionCount({ address: account });
}

// ---------------------------------------------------------------------------
// Non-EVM RPC helpers
// ---------------------------------------------------------------------------

/**
 * Check if a Solana account exists and has lamports.
 * Uses the standard Solana JSON-RPC.
 */
export async function solanaAccountInfo(
  address: string
): Promise<{ exists: boolean; lamports: number }> {
  const rpcUrl =
    process.env.RPC_URL_SOLANA || "https://api.mainnet-beta.solana.com";

  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getAccountInfo",
      params: [address, { encoding: "base64" }],
    }),
    signal: AbortSignal.timeout(10_000),
  });

  const data = await res.json();
  if (data.result?.value) {
    return { exists: true, lamports: data.result.value.lamports ?? 0 };
  }
  return { exists: false, lamports: 0 };
}

/**
 * Get Solana token accounts for an address (SPL tokens held).
 */
export async function solanaTokenAccounts(
  address: string
): Promise<number> {
  const rpcUrl =
    process.env.RPC_URL_SOLANA || "https://api.mainnet-beta.solana.com";

  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountsByOwner",
      params: [
        address,
        { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { encoding: "jsonParsed" },
      ],
    }),
    signal: AbortSignal.timeout(10_000),
  });

  const data = await res.json();
  return data.result?.value?.length ?? 0;
}

/**
 * Check Hyperliquid user state via their public API.
 */
export async function hyperliquidUserState(
  address: string
): Promise<{ active: boolean; accountValue: number }> {
  const res = await fetch("https://api.hyperliquid.xyz/info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "userState", user: address }),
    signal: AbortSignal.timeout(10_000),
  });

  const data = await res.json();
  if (data.marginSummary) {
    const accountValue = Number(data.marginSummary.accountValue ?? 0);
    return { active: accountValue > 0, accountValue };
  }
  return { active: false, accountValue: 0 };
}
