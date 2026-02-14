"use client";

import { EligibilityResult } from "@/lib/types";
import { CHAINS } from "@/lib/chains";

interface Props {
  result: EligibilityResult;
}

export default function ResultCard({ result }: Props) {
  const { airdrop, status, reason } = result;
  const chain = CHAINS[airdrop.chain];

  const statusConfig = {
    eligible: {
      badge: "Eligible",
      badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      cardBorder: "border-emerald-500/30",
      glow: "shadow-emerald-500/5",
    },
    not_eligible: {
      badge: "Not Eligible",
      badgeClass: "bg-red-500/15 text-red-400 border-red-500/30",
      cardBorder: "border-gray-700/50",
      glow: "",
    },
    already_claimed: {
      badge: "Claimed",
      badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      cardBorder: "border-amber-500/20",
      glow: "",
    },
  };

  const config = statusConfig[status];

  const deadlineDate = new Date(airdrop.claimDeadline);
  const now = new Date();
  const daysLeft = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className={`rounded-xl border ${config.cardBorder} bg-gray-900/60 backdrop-blur-sm p-5 transition-all hover:bg-gray-900/80 ${config.glow}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left side */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ backgroundColor: chain.color + "22", color: chain.color }}
            >
              {chain.icon}
            </span>
            <h3 className="text-white font-semibold truncate">{airdrop.name}</h3>
          </div>
          <p className="text-gray-400 text-sm mt-1">{airdrop.description}</p>
        </div>

        {/* Right side - status badge */}
        <span
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${config.badgeClass}`}
        >
          {config.badge}
        </span>
      </div>

      {/* Details */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <div>
          <span className="text-gray-500">Token: </span>
          <span className="text-white font-medium">
            {airdrop.tokenAmount} {airdrop.tokenSymbol}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Value: </span>
          <span className="text-white font-medium">{airdrop.usdValue}</span>
        </div>
        <div>
          <span className="text-gray-500">Deadline: </span>
          <span
            className={`font-medium ${
              daysLeft <= 14 ? "text-red-400" : daysLeft <= 30 ? "text-amber-400" : "text-gray-300"
            }`}
          >
            {airdrop.claimDeadline}
            {daysLeft > 0 && ` (${daysLeft}d left)`}
            {daysLeft <= 0 && " (expired)"}
          </span>
        </div>
      </div>

      {/* Reason */}
      <p className="mt-3 text-xs text-gray-500">{reason}</p>

      {/* CTA for eligible */}
      {status === "eligible" && (
        <a
          href={airdrop.claimUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Claim Now
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  );
}
