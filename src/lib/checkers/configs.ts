import type { AirdropConfig } from "./registry";

/**
 * Active airdrop configurations.
 *
 * This is empty by default — the app falls back to mock data when no
 * real configs are registered. See configs.example.ts for how to add
 * a real protocol integration.
 *
 * To add a real airdrop:
 *   1. Copy a config block from configs.example.ts
 *   2. Fill in the real contract address
 *   3. Implement fetchMerkleData to hit the real data source
 *   4. Add it to the array below
 */
export const AIRDROP_CONFIGS: AirdropConfig[] = [
  // Add real airdrop configs here
];
