import type { Airdrop, EligibilityResult, EligibilityStatus } from "@/lib/types";

// ---------------------------------------------------------------------------
// API-based airdrop checker
// ---------------------------------------------------------------------------

/**
 * ApiAirdropConfig: a flexible checker that calls an external API
 * to determine eligibility. Unlike MerkleDistributor-based configs,
 * these don't require a contract address or merkle data — they simply
 * call a protocol's public API.
 */
export interface ApiAirdropConfig {
  airdrop: Airdrop;
  /**
   * Check eligibility for the given address.
   * Should return { eligible: true, amount?, usdValue? } or { eligible: false }.
   * Throw on network errors — the wrapper handles them.
   */
  check: (address: string) => Promise<ApiCheckResult>;
}

export type ApiCheckResult =
  | { eligible: true; amount?: string; usdValue?: string; reason?: string }
  | { eligible: false; claimed?: boolean; reason?: string };

/**
 * Run an API-based eligibility check with timeout and error handling.
 */
export async function checkAirdropApi(
  address: string,
  config: ApiAirdropConfig
): Promise<EligibilityResult> {
  const { airdrop, check } = config;

  try {
    const result = await withTimeout(check(address), 15_000);

    if (result.eligible) {
      const amt = result.amount ?? airdrop.tokenAmount;
      const usd = result.usdValue ?? airdrop.usdValue;
      return {
        airdrop: { ...airdrop, tokenAmount: amt, usdValue: usd },
        status: "eligible",
        reason:
          result.reason ??
          `Your wallet qualifies for ${amt} ${airdrop.tokenSymbol}. Claim before ${airdrop.claimDeadline}!`,
      };
    }

    if (result.claimed) {
      return {
        airdrop,
        status: "already_claimed",
        reason:
          result.reason ??
          `This ${airdrop.protocol} airdrop has already been claimed by your wallet.`,
      };
    }

    return {
      airdrop,
      status: "not_eligible",
      reason:
        result.reason ??
        `Your wallet does not meet the eligibility criteria for this ${airdrop.protocol} airdrop.`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    // Network / RPC errors → don't penalise the user, just skip this check
    const isNetworkError =
      msg.includes("timed out") ||
      msg.includes("fetch") ||
      msg.includes("ECONNREFUSED") ||
      msg.includes("ENOTFOUND") ||
      msg.includes("network");
    return {
      airdrop,
      status: "not_eligible",
      reason: isNetworkError
        ? `Could not reach the ${airdrop.chain} RPC to verify eligibility. Try again later.`
        : `Could not verify eligibility: ${msg}`,
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), ms)
  );
  return Promise.race([promise, timeout]);
}

/**
 * Helper to make a fetch request with a standardized timeout and error handling.
 */
export async function apiFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(12_000),
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }

  return res;
}
