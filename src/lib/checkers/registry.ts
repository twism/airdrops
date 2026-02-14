import type { Hex } from "viem";
import type { Chain, Airdrop, EligibilityResult, EligibilityStatus } from "@/lib/types";
import { verifyMerkleProof, computeLeaf } from "./merkle";
import { isClaimed, readMerkleRoot } from "./onchain";

// ---------------------------------------------------------------------------
// Registry types
// ---------------------------------------------------------------------------

/**
 * MerkleEntry: what a protocol's published merkle JSON contains per address.
 * Protocols typically publish a file like:
 *   { "0xAbC...": { "index": 42, "amount": "1000000000000000000", "proof": ["0x...", ...] } }
 */
export interface MerkleEntry {
  index: number;
  amount: string; // wei string
  proof: Hex[];
}

/**
 * AirdropConfig: everything we need to check one airdrop.
 *
 * - `fetchMerkleData`: async function that returns the MerkleEntry for an
 *    address, or null if the address is not in the tree. This is where you
 *    plug in the real data source (IPFS, GitHub raw, protocol API, database).
 *
 * - `contractAddress`: on-chain MerkleDistributor contract address.
 */
export interface AirdropConfig {
  airdrop: Airdrop;
  contractAddress: Hex;
  fetchMerkleData: (address: string) => Promise<MerkleEntry | null>;
}

// ---------------------------------------------------------------------------
// Checker
// ---------------------------------------------------------------------------

export async function checkAirdrop(
  address: string,
  config: AirdropConfig
): Promise<EligibilityResult> {
  const { airdrop, contractAddress, fetchMerkleData } = config;
  const normalizedAddress = address.toLowerCase() as Hex;

  try {
    // Step 1: Look up address in the merkle tree data
    const entry = await fetchMerkleData(normalizedAddress);

    if (!entry) {
      return result(airdrop, "not_eligible", "Your address is not in the merkle tree for this airdrop.");
    }

    // Step 2: Check if already claimed on-chain
    const claimed = await isClaimed(
      airdrop.chain,
      contractAddress,
      BigInt(entry.index)
    );

    if (claimed) {
      return result(airdrop, "already_claimed", "This airdrop has already been claimed by your wallet.");
    }

    // Step 3: Verify the merkle proof (optional sanity check — the contract
    // will verify too, but this catches bad data before the user tries to claim)
    const root = await readMerkleRoot(airdrop.chain, contractAddress);
    const leaf = computeLeaf(
      BigInt(entry.index),
      normalizedAddress,
      BigInt(entry.amount)
    );
    const valid = verifyMerkleProof(entry.proof, root, leaf);

    if (!valid) {
      return result(airdrop, "not_eligible", "Merkle proof verification failed. The data may be outdated.");
    }

    // Format human-readable amount (assumes 18 decimals)
    const amountEth = (Number(BigInt(entry.amount)) / 1e18).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });

    return result(
      airdrop,
      "eligible",
      `You can claim ${amountEth} ${airdrop.tokenSymbol}. Claim before ${airdrop.claimDeadline}!`
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    // Surface the error but don't crash the whole check
    return result(airdrop, "not_eligible", `Could not verify: ${msg}`);
  }
}

function result(
  airdrop: Airdrop,
  status: EligibilityStatus,
  reason: string
): EligibilityResult {
  return { airdrop, status, reason };
}
