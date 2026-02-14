"use client";

import { useState } from "react";
import AddressInput from "@/components/AddressInput";
import ResultsList from "@/components/ResultsList";
import { Chain, EligibilityResult } from "@/lib/types";
import { CHAIN_LIST } from "@/lib/chains";

export default function Home() {
  const [results, setResults] = useState<EligibilityResult[] | null>(null);
  const [checkedAddress, setCheckedAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheck(address: string, chains: Chain[]) {
    setLoading(true);
    setResults(null);
    setError("");

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, chains }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResults(data.results);
      setCheckedAddress(address);
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResults(null);
    setCheckedAddress("");
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Airdrop
          <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Check
          </span>
        </h1>
        <p className="mt-3 text-gray-400 text-sm sm:text-base max-w-md mx-auto">
          Paste your wallet address to check eligibility for currently claimable
          airdrops across 8 chains. No wallet connection needed.
        </p>

        {/* Supported chains pills */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {CHAIN_LIST.map((chain) => (
            <span
              key={chain.id}
              className="px-2.5 py-1 rounded-full text-xs font-medium border border-gray-700/50 bg-gray-800/50 text-gray-400"
            >
              {chain.name}
            </span>
          ))}
        </div>
      </div>

      {/* Input */}
      <AddressInput onCheck={handleCheck} loading={loading} />

      {error && (
        <p className="text-center mt-4 text-red-400 text-sm">{error}</p>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <>
          <ResultsList results={results} address={checkedAddress} />
          <div className="text-center mt-8">
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-300 underline underline-offset-4 transition-colors"
            >
              Check another address
            </button>
          </div>
        </>
      )}

      {results && results.length === 0 && (
        <div className="text-center mt-12">
          <p className="text-gray-500">No airdrops found for the selected chains.</p>
          <button
            onClick={handleReset}
            className="mt-4 text-sm text-primary-400 hover:text-primary-300 underline underline-offset-4 transition-colors"
          >
            Try another address
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 text-center text-xs text-gray-600">
        <p>
          This is a demo using mock data. Always verify airdrop eligibility on
          official protocol websites.
        </p>
        <p className="mt-1">
          AirdropCheck &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}
