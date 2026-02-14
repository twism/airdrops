import { AddressType, Chain } from "./types";
import { CHAINS, CHAIN_LIST } from "./chains";

const EVM_REGEX = /^0x[a-fA-F0-9]{40}$/;
const SOLANA_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const SUI_REGEX = /^0x[a-fA-F0-9]{64}$/;

export function detectAddressType(address: string): AddressType {
  const trimmed = address.trim();

  // Sui addresses are 0x + 64 hex chars (check before EVM since both start with 0x)
  if (SUI_REGEX.test(trimmed)) return "sui";

  // EVM addresses are 0x + 40 hex chars
  if (EVM_REGEX.test(trimmed)) return "evm";

  // Solana addresses are base58, 32-44 chars
  if (SOLANA_REGEX.test(trimmed)) return "solana";

  return "unknown";
}

export function getCompatibleChains(addressType: AddressType): Chain[] {
  if (addressType === "unknown") return [];
  return CHAIN_LIST
    .filter((chain) => chain.addressType === addressType)
    .map((chain) => chain.id);
}

export function validateAddress(address: string): {
  valid: boolean;
  type: AddressType;
  chains: Chain[];
} {
  const type = detectAddressType(address.trim());
  const chains = getCompatibleChains(type);
  return {
    valid: type !== "unknown",
    type,
    chains,
  };
}
