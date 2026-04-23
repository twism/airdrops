# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at localhost:3000
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

There is no test runner configured; ESLint is the only automated quality check.

## Architecture

**AirdropCheck** is a Next.js 15 app that checks wallet eligibility for blockchain airdrops across 8 chains (Ethereum, Solana, Hyperliquid, Sui, Base, Polygon, Arbitrum, Optimism).

### Data flow

1. User submits a wallet address in `src/app/page.tsx` (client component)
2. `POST /api/check` (`src/app/api/check/route.ts`) validates input and orchestrates checks
3. `src/lib/eligibility.ts` runs all three check methods in parallel:
   - **Merkle proof checks** (`checkEligibilityMerkle`) — verifies keccak256 merkle proofs locally via `src/lib/checkers/registry.ts` and `merkle.ts`
   - **API/RPC checks** (`checkEligibilityApi`) — reads live on-chain state via `src/lib/checkers/api-checker.ts` using 30+ protocol configs in `api-configs.ts`
   - **Mock fallback** (`checkEligibilityMock`) — deterministic hash-based results for the 60+ airdrops in `src/data/airdrops.ts`
4. Results returned and rendered by `ResultsList.tsx` / `ResultCard.tsx`

### Key source files

| Path | Role |
|------|------|
| `src/lib/types.ts` | Core types: `Chain`, `AddressType`, `EligibilityResult`, `EligibilityStatus` |
| `src/lib/address.ts` | Address validation and chain compatibility (`EVM` / `Solana` / `Sui` detection) |
| `src/lib/chains.ts` | Chain metadata constants (`CHAINS`, `CHAIN_LIST`) |
| `src/lib/eligibility.ts` | Orchestrates all three check strategies |
| `src/lib/checkers/api-configs.ts` | 30 real protocol configs (EigenLayer, Jupiter, Hyperliquid, etc.) |
| `src/lib/checkers/onchain.ts` | Low-level RPC helpers: `erc20Balance`, `nativeBalance`, `txCount`, `solanaAccountInfo`, `hyperliquidUserState` |
| `src/lib/checkers/registry.ts` | Merkle distributor integration |
| `src/data/airdrops.ts` | 60+ mock airdrop definitions |

### Adding a new airdrop

- **API/RPC-based**: add an `ApiAirdropConfig` object to `src/lib/checkers/api-configs.ts`
- **Merkle-based**: add an `AirdropConfig` to `src/lib/checkers/configs.ts` following the pattern in `configs.example.ts`
- **Mock only**: add an entry to `src/data/airdrops.ts`

### Environment variables

Per-chain RPC URLs can be overridden via environment variables:

```
RPC_URL_ETHEREUM
RPC_URL_BASE
RPC_URL_POLYGON
RPC_URL_ARBITRUM
RPC_URL_OPTIMISM
RPC_URL_SOLANA   # defaults to https://api.mainnet-beta.solana.com
```

Hyperliquid uses `https://api.hyperliquid.xyz/info` (no override needed).

### Styling

Tailwind CSS with a custom `primary` color scale (indigo → blue). Dark-mode-first design. Chain accent colors come from `src/lib/chains.ts` metadata. Status colors: green = eligible, red = not eligible, amber = already claimed.
