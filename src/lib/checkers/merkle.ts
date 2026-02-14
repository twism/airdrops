import { keccak256, encodePacked, type Hex } from "viem";

/**
 * Verify a merkle proof for an airdrop claim.
 *
 * Standard layout used by most EVM airdrops (OpenZeppelin style):
 *   leaf = keccak256(abi.encodePacked(index, account, amount))
 *
 * The proof is an array of sibling hashes from leaf to root.
 */
export function verifyMerkleProof(
  proof: Hex[],
  root: Hex,
  leaf: Hex
): boolean {
  let hash = leaf;

  for (const sibling of proof) {
    // Sort pair so tree is deterministic regardless of left/right position
    if (hash < sibling) {
      hash = keccak256(encodePacked(["bytes32", "bytes32"], [hash, sibling]));
    } else {
      hash = keccak256(encodePacked(["bytes32", "bytes32"], [sibling, hash]));
    }
  }

  return hash === root;
}

/**
 * Compute a standard airdrop leaf.
 * Most protocols use: keccak256(abi.encodePacked(index, account, amount))
 */
export function computeLeaf(
  index: bigint,
  account: Hex,
  amount: bigint
): Hex {
  return keccak256(
    encodePacked(
      ["uint256", "address", "uint256"],
      [index, account, amount]
    )
  );
}
