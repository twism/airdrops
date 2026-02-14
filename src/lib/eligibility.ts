import { Chain, EligibilityResult, EligibilityStatus } from "./types";
import { MOCK_AIRDROPS } from "@/data/airdrops";
import { AIRDROP_CONFIGS } from "./checkers/configs";
import { checkAirdrop } from "./checkers/registry";
import { API_AIRDROP_CONFIGS } from "./checkers/api-configs";
import { checkAirdropApi } from "./checkers/api-checker";

// ---------------------------------------------------------------------------
// Real eligibility checks — Merkle proof + on-chain
// ---------------------------------------------------------------------------

export async function checkEligibilityMerkle(
  address: string,
  chains: Chain[]
): Promise<EligibilityResult[]> {
  const relevantConfigs = AIRDROP_CONFIGS.filter((c) =>
    chains.includes(c.airdrop.chain)
  );

  if (relevantConfigs.length === 0) {
    return [];
  }

  const results = await Promise.all(
    relevantConfigs.map((config) => checkAirdrop(address, config))
  );

  return results;
}

// ---------------------------------------------------------------------------
// Real eligibility checks — API-based
// ---------------------------------------------------------------------------

export async function checkEligibilityApi(
  address: string,
  chains: Chain[]
): Promise<EligibilityResult[]> {
  const relevantConfigs = API_AIRDROP_CONFIGS.filter((c) =>
    chains.includes(c.airdrop.chain)
  );

  if (relevantConfigs.length === 0) {
    return [];
  }

  // Run all API checks in parallel
  const results = await Promise.all(
    relevantConfigs.map((config) => checkAirdropApi(address, config))
  );

  return results;
}

// ---------------------------------------------------------------------------
// Mock fallback (airdrops without a real integration)
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
  // Collect IDs of airdrops that have a real integration (merkle or API)
  const realIds = new Set([
    ...AIRDROP_CONFIGS.map((c) => c.airdrop.id),
    ...API_AIRDROP_CONFIGS.map((c) => c.airdrop.id),
  ]);

  // Only mock airdrops that don't have a real integration
  const airdrops = MOCK_AIRDROPS.filter(
    (a) => chains.includes(a.chain) && !realIds.has(a.id)
  );

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
// Combined: real (merkle + API) + mock fallback
// ---------------------------------------------------------------------------

export async function checkEligibility(
  address: string,
  chains: Chain[]
): Promise<EligibilityResult[]> {
  const [merkleResults, apiResults, mockResults] = await Promise.all([
    checkEligibilityMerkle(address, chains),
    checkEligibilityApi(address, chains),
    Promise.resolve(checkEligibilityMock(address, chains)),
  ]);

  return [...merkleResults, ...apiResults, ...mockResults];
}
