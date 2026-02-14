import { Chain, EligibilityResult, EligibilityStatus } from "./types";
import { MOCK_AIRDROPS } from "@/data/airdrops";

/**
 * Mock eligibility checker.
 * Uses a deterministic hash of the address to decide eligibility per airdrop,
 * so the same address always gets the same results.
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getStatus(address: string, airdropId: string): EligibilityStatus {
  const hash = simpleHash(address.toLowerCase() + airdropId);
  const mod = hash % 100;

  if (mod < 40) return "eligible";
  if (mod < 85) return "not_eligible";
  return "already_claimed";
}

function getReason(status: EligibilityStatus, protocolName: string): string {
  switch (status) {
    case "eligible":
      return `Your wallet qualifies for this ${protocolName} airdrop. Claim before the deadline!`;
    case "not_eligible":
      return `Your wallet does not meet the eligibility criteria for this ${protocolName} airdrop.`;
    case "already_claimed":
      return `This ${protocolName} airdrop has already been claimed by your wallet.`;
  }
}

export function checkEligibility(
  address: string,
  chains: Chain[]
): EligibilityResult[] {
  const airdrops = MOCK_AIRDROPS.filter((a) => chains.includes(a.chain));

  return airdrops.map((airdrop) => {
    const status = getStatus(address, airdrop.id);
    return {
      airdrop,
      status,
      reason: getReason(status, airdrop.protocol),
    };
  });
}
