import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AirdropCheck — Free Airdrop Eligibility Checker",
  description:
    "Check if your wallet is eligible for airdrops on Ethereum, Solana, Hyperliquid, Sui, Base, Polygon, Arbitrum, and Optimism. No wallet connection needed.",
  keywords: [
    "airdrop",
    "crypto airdrop",
    "eligibility checker",
    "ethereum airdrop",
    "solana airdrop",
    "hyperliquid airdrop",
    "sui airdrop",
    "free crypto",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
