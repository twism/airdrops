/**
 * EXAMPLE: How to register a real airdrop.
 *
 * Copy this file to `configs.ts` and fill in real values.
 * Each airdrop needs:
 *   1. The Airdrop metadata (name, chain, token, etc.)
 *   2. The on-chain MerkleDistributor contract address
 *   3. A function to fetch merkle data for an address
 *
 * The fetchMerkleData function is where you plug in the real data source.
 * Common patterns:
 *
 *   a) Fetch from a protocol's published JSON on GitHub/IPFS:
 *      const res = await fetch(`https://raw.githubusercontent.com/org/repo/main/merkle.json`);
 *      const tree = await res.json();
 *      return tree[address] ?? null;
 *
 *   b) Query a protocol API:
 *      const res = await fetch(`https://api.protocol.xyz/airdrop/${address}`);
 *      if (!res.ok) return null;
 *      return res.json();
 *
 *   c) Look up in a local database / KV store:
 *      return await db.merkleEntries.findByAddress(address);
 */

import type { AirdropConfig, MerkleEntry } from "./registry";
import type { Hex } from "viem";

// ---- Example: EigenLayer Season 2 ----

const eigenlayerConfig: AirdropConfig = {
  airdrop: {
    id: "eigenlayer-s2",
    name: "EigenLayer Season 2",
    protocol: "EigenLayer",
    chain: "ethereum",
    tokenSymbol: "EIGEN",
    tokenAmount: "—",      // filled dynamically from merkle data
    usdValue: "—",          // filled dynamically or from a price API
    claimDeadline: "2026-05-01",
    description: "For restakers and AVS operators on EigenLayer.",
    claimUrl: "https://claims.eigenfoundation.org/",
  },

  // The MerkleDistributor contract address on Ethereum mainnet
  contractAddress: "0x1234567890abcdef1234567890abcdef12345678" as Hex,

  // Fetch this address's merkle entry from wherever the protocol published it
  fetchMerkleData: async (address: string): Promise<MerkleEntry | null> => {
    // Option A: JSON hosted on GitHub / IPFS
    // Replace with the real URL where the merkle tree is published
    const url = `https://raw.githubusercontent.com/example-org/airdrop-data/main/merkle.json`;

    try {
      const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1h
      if (!res.ok) return null;

      const tree: Record<string, MerkleEntry> = await res.json();
      return tree[address.toLowerCase()] ?? null;
    } catch {
      return null;
    }
  },
};

// ---- Export all registered airdrops ----

export const AIRDROP_CONFIGS: AirdropConfig[] = [
  eigenlayerConfig,
  // Add more here as you integrate them:
  // jupiterConfig,
  // hyperliquidConfig,
  // optimismS5Config,
];
