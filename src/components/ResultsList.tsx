"use client";

import { useState } from "react";
import { EligibilityResult, Chain, EligibilityStatus } from "@/lib/types";
import { CHAINS } from "@/lib/chains";
import ResultCard from "./ResultCard";

interface Props {
  results: EligibilityResult[];
  address: string;
}

type FilterStatus = "all" | EligibilityStatus;

export default function ResultsList({ results, address }: Props) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterChain, setFilterChain] = useState<Chain | "all">("all");

  const filtered = results.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (filterChain !== "all" && r.airdrop.chain !== filterChain) return false;
    return true;
  });

  const eligibleCount = results.filter((r) => r.status === "eligible").length;
  const totalValue = results
    .filter((r) => r.status === "eligible")
    .reduce((sum, r) => {
      const val = parseFloat(r.airdrop.usdValue.replace(/[$,]/g, ""));
      return sum + val;
    }, 0);

  const uniqueChains = [...new Set(results.map((r) => r.airdrop.chain))];

  return (
    <div className="w-full max-w-3xl mx-auto mt-10">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{results.length}</div>
          <div className="text-xs text-gray-500 mt-1">Airdrops Found</div>
        </div>
        <div className="bg-gray-900/60 border border-emerald-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{eligibleCount}</div>
          <div className="text-xs text-gray-500 mt-1">Eligible</div>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-gray-900/60 border border-primary-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary-400">
            ${totalValue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Total Claimable</div>
        </div>
      </div>

      {/* Checked address */}
      <div className="mb-4 px-1">
        <span className="text-xs text-gray-500">Results for </span>
        <span className="text-xs text-gray-400 font-mono break-all">{address}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "eligible", "not_eligible", "already_claimed"] as FilterStatus[]).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === status
                  ? "bg-primary-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-gray-200"
              }`}
            >
              {status === "all"
                ? "All"
                : status === "eligible"
                ? "Eligible"
                : status === "not_eligible"
                ? "Not Eligible"
                : "Claimed"}
            </button>
          )
        )}

        <span className="w-px h-6 bg-gray-700 self-center mx-1" />

        <button
          onClick={() => setFilterChain("all")}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            filterChain === "all"
              ? "bg-primary-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-gray-200"
          }`}
        >
          All Chains
        </button>
        {uniqueChains.map((chainId) => {
          const chain = CHAINS[chainId];
          return (
            <button
              key={chainId}
              onClick={() => setFilterChain(chainId)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterChain === chainId
                  ? "text-white"
                  : "bg-gray-800 text-gray-400 hover:text-gray-200"
              }`}
              style={
                filterChain === chainId
                  ? { backgroundColor: chain.color + "44", color: chain.color }
                  : {}
              }
            >
              {chain.name}
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No airdrops match the current filters.
          </div>
        ) : (
          filtered.map((result) => (
            <ResultCard key={result.airdrop.id} result={result} />
          ))
        )}
      </div>
    </div>
  );
}
