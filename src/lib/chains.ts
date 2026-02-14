import { Chain, ChainInfo } from "./types";

export const CHAINS: Record<Chain, ChainInfo> = {
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    addressType: "evm",
    color: "#627EEA",
    icon: "ETH",
  },
  solana: {
    id: "solana",
    name: "Solana",
    addressType: "solana",
    color: "#9945FF",
    icon: "SOL",
  },
  hyperliquid: {
    id: "hyperliquid",
    name: "Hyperliquid",
    addressType: "evm",
    color: "#50E3C2",
    icon: "HL",
  },
  sui: {
    id: "sui",
    name: "Sui",
    addressType: "sui",
    color: "#6FBCF0",
    icon: "SUI",
  },
  base: {
    id: "base",
    name: "Base",
    addressType: "evm",
    color: "#0052FF",
    icon: "BASE",
  },
  polygon: {
    id: "polygon",
    name: "Polygon",
    addressType: "evm",
    color: "#8247E5",
    icon: "POL",
  },
  arbitrum: {
    id: "arbitrum",
    name: "Arbitrum",
    addressType: "evm",
    color: "#28A0F0",
    icon: "ARB",
  },
  optimism: {
    id: "optimism",
    name: "Optimism",
    addressType: "evm",
    color: "#FF0420",
    icon: "OP",
  },
};

export const CHAIN_LIST = Object.values(CHAINS);
