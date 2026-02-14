import type { ApiAirdropConfig, ApiCheckResult } from "./api-checker";
import { apiFetch } from "./api-checker";

// ═══════════════════════════════════════════════════════════════════════════
// Real API integrations for airdrop eligibility checking.
//
// Each config calls a protocol's public API to determine if an address
// is eligible. All endpoints are server-side only (called from Next.js
// API routes), so CORS is not a concern.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Ethereum ─────────────────────────────────────────────────────────────

const zksyncConfig: ApiAirdropConfig = {
  airdrop: {
    id: "zksync-eth",
    name: "ZKsync ZK Airdrop",
    protocol: "ZKsync",
    chain: "ethereum",
    tokenSymbol: "ZK",
    tokenAmount: "3,400",
    usdValue: "$680",
    claimDeadline: "2026-06-30",
    description:
      "For ZKsync Era bridge users, DeFi participants, and early adopters.",
    claimUrl: "https://claim.zknation.io",
  },
  check: async (address: string): Promise<ApiCheckResult> => {
    const res = await apiFetch(
      `https://api.zknation.io/eligibility?id=${address}`
    );
    const data = await res.json();
    // ZKsync API returns { allocations: [...] } with token amounts
    if (data.allocations && data.allocations.length > 0) {
      const totalTokens = data.allocations.reduce(
        (sum: number, a: { tokenAmount?: string }) =>
          sum + Number(a.tokenAmount ?? 0),
        0
      );
      const amount = (totalTokens / 1e18).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      });
      return { eligible: true, amount };
    }
    return { eligible: false };
  },
};

const eigenlayerConfig: ApiAirdropConfig = {
  airdrop: {
    id: "eigenlayer-eth",
    name: "EigenLayer Season 2",
    protocol: "EigenLayer",
    chain: "ethereum",
    tokenSymbol: "EIGEN",
    tokenAmount: "450",
    usdValue: "$2,700",
    claimDeadline: "2026-05-01",
    description: "For restakers and AVS operators on EigenLayer.",
    claimUrl: "https://claims.eigenfoundation.org",
  },
  check: async (address: string): Promise<ApiCheckResult> => {
    const res = await apiFetch(
      `https://claims.eigenfoundation.org/claimable-amount?address=${address}`
    );
    const data = await res.json();
    if (data.claimableAmount && Number(data.claimableAmount) > 0) {
      const amount = (Number(data.claimableAmount) / 1e18).toLocaleString(
        undefined,
        { maximumFractionDigits: 2 }
      );
      return { eligible: true, amount };
    }
    if (data.claimed) {
      return { eligible: false, claimed: true };
    }
    return { eligible: false };
  },
};

const starknetConfig: ApiAirdropConfig = {
  airdrop: {
    id: "starknet-eth",
    name: "Starknet STRK Airdrop",
    protocol: "Starknet",
    chain: "ethereum",
    tokenSymbol: "STRK",
    tokenAmount: "1,250",
    usdValue: "$1,875",
    claimDeadline: "2026-06-15",
    description:
      "Reward for early Ethereum bridge users and Starknet ecosystem participants.",
    claimUrl: "https://provisions.starknet.io",
  },
  check: async (address: string): Promise<ApiCheckResult> => {
    const res = await apiFetch(
      `https://provisions.starknet.io/api/provision/${address}`
    );
    const data = await res.json();
    if (data.eligibleAmount && Number(data.eligibleAmount) > 0) {
      const amount = (Number(data.eligibleAmount) / 1e18).toLocaleString(
        undefined,
        { maximumFractionDigits: 0 }
      );
      return { eligible: true, amount };
    }
    return { eligible: false };
  },
};

const layerzeroConfig: ApiAirdropConfig = {
  airdrop: {
    id: "layerzero-eth",
    name: "LayerZero ZRO Airdrop",
    protocol: "LayerZero",
    chain: "ethereum",
    tokenSymbol: "ZRO",
    tokenAmount: "500",
    usdValue: "$1,750",
    claimDeadline: "2026-07-15",
    description:
      "For cross-chain messaging users and Stargate bridge participants.",
    claimUrl: "https://layerzero.foundation/eligibility",
  },
  check: async (address: string): Promise<ApiCheckResult> => {
    const res = await apiFetch(
      `https://www.layerzero.foundation/api/proof/${address}`
    );
    const data = await res.json();
    if (data.amount && Number(data.amount) > 0) {
      const amount = (Number(data.amount) / 1e18).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      });
      return {
        eligible: true,
        amount,
        reason: data.isEligible === false
          ? undefined
          : `You can claim ${amount} ZRO. Claim before the deadline!`,
      };
    }
    return { eligible: false };
  },
};

const scrollConfig: ApiAirdropConfig = {
  airdrop: {
    id: "scroll-eth",
    name: "Scroll SCR Airdrop",
    protocol: "Scroll",
    chain: "ethereum",
    tokenSymbol: "SCR",
    tokenAmount: "1,200",
    usdValue: "$960",
    claimDeadline: "2026-05-20",
    description:
      "For Scroll mainnet bridge users and DeFi ecosystem participants.",
    claimUrl: "https://scroll.io/claim",
  },
  check: async (address: string): Promise<ApiCheckResult> => {
    const res = await apiFetch(
      `https://claim.scroll.io/api/check?address=${address}`
    );
    const data = await res.json();
    if (data.amount && Number(data.amount) > 0) {
      const amount = (Number(data.amount) / 1e18).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      });
      return { eligible: true, amount };
    }
    if (data.claimed) {
      return { eligible: false, claimed: true };
    }
    return { eligible: false };
  },
};

const ethenaConfig: ApiAirdropConfig = {
  airdrop: {
    id: "ethena-eth",
    name: "Ethena Season 3",
    protocol: "Ethena",
    chain: "ethereum",
    tokenSymbol: "ENA",
    tokenAmount: "2,800",
    usdValue: "$2,240",
    claimDeadline: "2026-08-01",
    description:
      "For USDe holders, sUSDe stakers, and Ethena LP participants.",
    claimUrl: "https://claim.ethena.fi",
  },
  check: async (address: string): Promise<ApiCheckResult> => {
    const res = await apiFetch(
      `https://claim.ethena.fi/api/eligibility?address=${address}`
    );
    const data = await res.json();
    if (data.totalClaimable && Number(data.totalClaimable) > 0) {
      const amount = (Number(data.totalClaimable) / 1e18).toLocaleString(
        undefined,
        { maximumFractionDigits: 0 }
      );
      return { eligible: true, amount };
    }
    if (data.hasClaimed) {
      return { eligible: false, claimed: true };
    }
    return { eligible: false };
  },
};

const debridgeConfig: ApiAirdropConfig = {
  airdrop: {
    id: "debridge-eth",
    name: "deBridge DBR Airdrop",
    protocol: "deBridge",
    chain: "ethereum",
    tokenSymbol: "DBR",
    tokenAmount: "4,200",
    usdValue: "$840",
    claimDeadline: "2026-05-15",
    description:
      "For deBridge cross-chain transfer users and liquidity providers.",
    claimUrl: "https://app.debridge.finance/airdrop",
  },
  check: async (address: string): Promise<ApiCheckResult> => {
    const res = await apiFetch(
      `https://points-api.debridge.finance/api/TokenDistribution/check-reward?address=${address}`
    );
    const data = await res.json();
    if (data.totalReward && Number(data.totalReward) > 0) {
      const amount = Number(data.totalReward).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      });
      return { eligible: true, amount };
    }
    return { eligible: false };
  },
};

const safeConfig: ApiAirdropConfig = {
  airdrop: {
    id: "safe-eth",
    name: "Safe Ecosystem Rewards",
    protocol: "Safe",
    chain: "ethereum",
    tokenSymbol: "SAFE",
    tokenAmount: "600",
    usdValue: "$900",
    claimDeadline: "2026-09-01",
    description: "For Safe multisig creators and active signers.",
    claimUrl: "https://safe.global/claim",
  },
  check: async (address: string): Promise<ApiCheckResult> => {
    // Check if address owns/is signer on any Safe wallets
    const res = await apiFetch(
      `https://safe-transaction-mainnet.safe.global/api/v1/owners/${address}/safes/`
    );
    const data = await res.json();
    if (data.safes && data.safes.length > 0) {
      return {
        eligible: true,
        reason: `Your wallet is a signer on ${data.safes.length} Safe wallet(s). You may be eligible for SAFE rewards.`,
      };
    }
    return {
      eligible: false,
      reason: "No Safe wallets found for this address.",
    };
  },
};

const penguConfig: ApiAirdropConfig = {
  airdrop: {
    id: "pengu-eth",
    name: "Pudgy Penguins PENGU",
    protocol: "Pudgy Penguins",
    chain: "ethereum",
    tokenSymbol: "PENGU",
    tokenAmount: "45,000",
    usdValue: "$1,350",
    claimDeadline: "2026-06-15",
    description: "For Pudgy Penguins, Lil Pudgys, and Rods holders.",
    claimUrl: "https://claim.pudgypenguins.com",
  },
  check: async (address: string): Promise<ApiCheckResult> => {
    const res = await apiFetch(
      `https://claim.pudgypenguins.com/api/allocation/${address}`
    );
    const data = await res.json();
    if (data.amount && Number(data.amount) > 0) {
      const amount = (Number(data.amount) / 1e18).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      });
      return { eligible: true, amount };
    }
    if (data.claimed) {
      return { eligible: false, claimed: true };
    }
    return { eligible: false };
  },
};

// ─── Solana ───────────────────────────────────────────────────────────────

const jupiterConfig: ApiAirdropConfig = {
  airdrop: {
    id: "jupiter-sol",
    name: "Jupiter Jupuary Round 2",
    protocol: "Jupiter",
    chain: "solana",
    tokenSymbol: "JUP",
    tokenAmount: "1,800",
    usdValue: "$1,440",
    claimDeadline: "2026-07-01",
    description: "For active Jupiter swap and limit order users.",
    claimUrl: "https://jup.ag/claim",
  },
  check: async (address: string): Promise<ApiCheckResult> => {
    const res = await apiFetch(`https://worker.jup.ag/airdrop/${address}`);
    const data = await res.json();
    if (data.amount && Number(data.amount) > 0) {
      const amount = (Number(data.amount) / 1e6).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      });
      return { eligible: true, amount };
    }
    return { eligible: false };
  },
};

const magicedenConfig: ApiAirdropConfig = {
  airdrop: {
    id: "magiceden-sol",
    name: "Magic Eden ME Airdrop",
    protocol: "Magic Eden",
    chain: "solana",
    tokenSymbol: "ME",
    tokenAmount: "1,200",
    usdValue: "$3,600",
    claimDeadline: "2026-04-20",
    description:
      "For Magic Eden NFT traders, cross-chain bridge users, and collectors.",
    claimUrl: "https://mefoundation.com/claim",
  },
  check: async (address: string): Promise<ApiCheckResult> => {
    const res = await apiFetch(
      `https://mefoundation.com/api/allocation/${address}`
    );
    const data = await res.json();
    if (data.totalAllocation && Number(data.totalAllocation) > 0) {
      const amount = (Number(data.totalAllocation) / 1e9).toLocaleString(
        undefined,
        { maximumFractionDigits: 0 }
      );
      return { eligible: true, amount };
    }
    if (data.claimed) {
      return { eligible: false, claimed: true };
    }
    return { eligible: false };
  },
};

// ─── Hyperliquid ──────────────────────────────────────────────────────────

const hyperliquidConfig: ApiAirdropConfig = {
  airdrop: {
    id: "hyperliquid-hl",
    name: "Hyperliquid Points Season 2",
    protocol: "Hyperliquid",
    chain: "hyperliquid",
    tokenSymbol: "HYPE",
    tokenAmount: "5,000",
    usdValue: "$12,500",
    claimDeadline: "2026-03-31",
    description:
      "For active traders and liquidity providers on Hyperliquid DEX.",
    claimUrl: "https://app.hyperliquid.xyz/airdrop",
  },
  check: async (address: string): Promise<ApiCheckResult> => {
    // Hyperliquid's public info API — check if address has trading history
    const res = await apiFetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "userState", user: address }),
    });
    const data = await res.json();
    // If the user has any margin usage or open positions, they're an active trader
    if (data.marginSummary) {
      const accountValue = Number(data.marginSummary.accountValue ?? 0);
      if (accountValue > 0) {
        return {
          eligible: true,
          reason:
            "Your wallet has trading history on Hyperliquid and may qualify for the HYPE airdrop.",
        };
      }
    }
    // Also check if they have any historical fills
    if (data.crossMarginSummary || data.assetPositions?.length > 0) {
      return {
        eligible: true,
        reason:
          "Your wallet has positions on Hyperliquid and may qualify for the HYPE airdrop.",
      };
    }
    return {
      eligible: false,
      reason: "No trading activity found on Hyperliquid for this address.",
    };
  },
};

// ─── Optimism ─────────────────────────────────────────────────────────────

const optimismConfig: ApiAirdropConfig = {
  airdrop: {
    id: "op-season5",
    name: "Optimism Season 5",
    protocol: "Optimism",
    chain: "optimism",
    tokenSymbol: "OP",
    tokenAmount: "650",
    usdValue: "$1,300",
    claimDeadline: "2026-04-15",
    description:
      "For active Optimism users, delegates, and governance participants.",
    claimUrl: "https://app.optimism.io/airdrop/check",
  },
  check: async (address: string): Promise<ApiCheckResult> => {
    const res = await apiFetch(
      `https://api.optimism.io/airdrop/check/${address}`
    );
    const data = await res.json();
    if (data.isEligible && data.amount) {
      const amount = (Number(data.amount) / 1e18).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      });
      return { eligible: true, amount };
    }
    if (data.hasClaimed) {
      return { eligible: false, claimed: true };
    }
    return { eligible: false };
  },
};

// ─── Arbitrum ─────────────────────────────────────────────────────────────

const pendleConfig: ApiAirdropConfig = {
  airdrop: {
    id: "pendle-arb",
    name: "Pendle Yield Rewards",
    protocol: "Pendle",
    chain: "arbitrum",
    tokenSymbol: "PENDLE",
    tokenAmount: "800",
    usdValue: "$3,200",
    claimDeadline: "2026-07-20",
    description:
      "For yield traders and liquidity providers on Pendle Arbitrum.",
    claimUrl: "https://app.pendle.finance/claim",
  },
  check: async (address: string): Promise<ApiCheckResult> => {
    const res = await apiFetch(
      `https://api-v2.pendle.finance/core/v1/42161/users/${address}/rewards`
    );
    const data = await res.json();
    if (data.totalReward && Number(data.totalReward) > 0) {
      const amount = Number(data.totalReward).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      });
      return { eligible: true, amount };
    }
    return { eligible: false };
  },
};

// ─── Base ─────────────────────────────────────────────────────────────────

const aerodromeConfig: ApiAirdropConfig = {
  airdrop: {
    id: "aerodrome-base",
    name: "Aerodrome Season 3",
    protocol: "Aerodrome",
    chain: "base",
    tokenSymbol: "AERO",
    tokenAmount: "3,200",
    usdValue: "$4,160",
    claimDeadline: "2026-07-15",
    description:
      "For liquidity providers and veAERO lockers on Base.",
    claimUrl: "https://aerodrome.finance/claim",
  },
  check: async (address: string): Promise<ApiCheckResult> => {
    const res = await apiFetch(
      `https://api.aerodrome.finance/v1/rewards/${address}`
    );
    const data = await res.json();
    if (data.claimableAmount && Number(data.claimableAmount) > 0) {
      const amount = (Number(data.claimableAmount) / 1e18).toLocaleString(
        undefined,
        { maximumFractionDigits: 0 }
      );
      return { eligible: true, amount };
    }
    return { eligible: false };
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Export all API-based configs
// ═══════════════════════════════════════════════════════════════════════════

export const API_AIRDROP_CONFIGS: ApiAirdropConfig[] = [
  // Ethereum
  zksyncConfig,
  eigenlayerConfig,
  starknetConfig,
  layerzeroConfig,
  scrollConfig,
  ethenaConfig,
  debridgeConfig,
  safeConfig,
  penguConfig,
  // Solana
  jupiterConfig,
  magicedenConfig,
  // Hyperliquid
  hyperliquidConfig,
  // Optimism
  optimismConfig,
  // Arbitrum
  pendleConfig,
  // Base
  aerodromeConfig,
];
