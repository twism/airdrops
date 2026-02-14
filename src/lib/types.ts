export type Chain =
  | "ethereum"
  | "solana"
  | "hyperliquid"
  | "sui"
  | "base"
  | "polygon"
  | "arbitrum"
  | "optimism";

export type AddressType = "evm" | "solana" | "sui" | "unknown";

export type EligibilityStatus = "eligible" | "not_eligible" | "already_claimed";

export interface Airdrop {
  id: string;
  name: string;
  protocol: string;
  chain: Chain;
  tokenSymbol: string;
  tokenAmount: string;
  usdValue: string;
  claimDeadline: string;
  description: string;
  claimUrl: string;
  logoUrl?: string;
}

export interface EligibilityResult {
  airdrop: Airdrop;
  status: EligibilityStatus;
  reason: string;
}

export interface ChainInfo {
  id: Chain;
  name: string;
  addressType: AddressType;
  color: string;
  icon: string;
}
