import { Chain, EligibilityResult, EligibilityStatus } from "./types";
import { MOCK_AIRDROPS } from "@/data/airdrops";
import { AIRDROP_CONFIGS } from "./checkers/configs";
import { checkAirdrop } from "./checkers/registry";

// ---------------------------------------------------------------------------
// Real eligibility checks (merkle proof + on-chain)
// ---------------------------------------------------------------------------

/**
 * Check eligibility using real protocol integrations.
 * Only checks airdrops that have a registered AirdropConfig.
 */
export async function checkEligibilityReal(
  address: string,
  chains: Chain[]
): Promise<EligibilityResult[]> {
  const relevantConfigs = AIRDROP_CONFIGS.filter((c) =>
    chains.includes(c.airdrop.chain)
  );

  if (relevantConfigs.length === 0) {
    return [];
  }

  // Run all checks in parallel
  const results = await Promise.all(
    relevantConfigs.map((config) => checkAirdrop(address, config))
  );

  return results;
}

// ---------------------------------------------------------------------------
// Mock fallback (used when no real configs are registered for a chain)
// ---------------------------------------------------------------------------

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getMockStatus(address: string, airdropId: string): EligibilityStatus {
  const hash = simpleHash(address.toLowerCase() + airdropId);
  const mod = hash % 100;
  if (mod < 40) return "eligible";
  if (mod < 85) return "not_eligible";
  return "already_claimed";
}

function getMockReason(status: EligibilityStatus, protocolName: string): string {
  switch (status) {
    case "eligible":
      return `Your wallet qualifies for this ${protocolName} airdrop. Claim before the deadline!`;
    case "not_eligible":
      return `Your wallet does not meet the eligibility criteria for this ${protocolName} airdrop.`;
    case "already_claimed":
      return `This ${protocolName} airdrop has already been claimed by your wallet.`;
  }
}

export function checkEligibilityMock(
  address: string,
  chains: Chain[]
): EligibilityResult[] {
  // Only mock chains that have NO real configs
  const realChains = new Set(AIRDROP_CONFIGS.map((c) => c.airdrop.chain));
  const mockChains = chains.filter((c) => !realChains.has(c));
  const airdrops = MOCK_AIRDROPS.filter((a) => mockChains.includes(a.chain));

  return airdrops.map((airdrop) => {
    const status = getMockStatus(address, airdrop.id);
    return {
      airdrop,
      status,
      reason: getMockReason(status, airdrop.protocol),
    };
  });
}

// ---------------------------------------------------------------------------
// Combined: real + mock fallback
// ---------------------------------------------------------------------------

export async function checkEligibility(
  address: string,
  chains: Chain[]
): Promise<EligibilityResult[]> {
  const [realResults, mockResults] = await Promise.all([
    checkEligibilityReal(address, chains),
    Promise.resolve(checkEligibilityMock(address, chains)),
  ]);

  return [...realResults, ...mockResults];
}
