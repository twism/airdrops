"use client";

import { useState } from "react";
import { validateAddress } from "@/lib/address";
import { CHAINS } from "@/lib/chains";
import { Chain } from "@/lib/types";

interface Props {
  onCheck: (address: string, chains: Chain[]) => void;
  loading: boolean;
}

export default function AddressInput({ onCheck, loading }: Props) {
  const [address, setAddress] = useState("");
  const [selectedChains, setSelectedChains] = useState<Chain[]>([]);
  const [error, setError] = useState("");
  const [detectedType, setDetectedType] = useState("");

  function handleAddressChange(value: string) {
    setAddress(value);
    setError("");

    const trimmed = value.trim();
    if (!trimmed) {
      setDetectedType("");
      setSelectedChains([]);
      return;
    }

    const result = validateAddress(trimmed);
    if (result.valid) {
      setDetectedType(result.type);
      setSelectedChains(result.chains);
    } else if (trimmed.length > 10) {
      setDetectedType("");
      setSelectedChains([]);
      setError("Unrecognized address format. Please enter a valid wallet address.");
    }
  }

  function toggleChain(chain: Chain) {
    setSelectedChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) {
      setError("Please enter a wallet address.");
      return;
    }
    if (selectedChains.length === 0) {
      setError("Please select at least one chain.");
      return;
    }
    onCheck(trimmed, selectedChains);
  }

  const validation = address.trim() ? validateAddress(address.trim()) : null;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      {/* Address Input */}
      <div className="relative">
        <input
          type="text"
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder="Paste your wallet address (EVM, Solana, or Sui)"
          className="w-full px-5 py-4 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm sm:text-base font-mono transition-colors"
          spellCheck={false}
          autoComplete="off"
        />
        {detectedType && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-md bg-primary-900/50 text-primary-300 border border-primary-700/50">
            {detectedType.toUpperCase()}
          </span>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}

      {/* Chain Selection */}
      {validation?.valid && (
        <div className="mt-4">
          <p className="text-sm text-gray-400 mb-2">
            Compatible chains detected — toggle to include/exclude:
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CHAINS) as Chain[]).map((chainId) => {
              const chain = CHAINS[chainId];
              const compatible = validation.chains.includes(chainId);
              const selected = selectedChains.includes(chainId);

              return (
                <button
                  key={chainId}
                  type="button"
                  disabled={!compatible}
                  onClick={() => compatible && toggleChain(chainId)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${
                      !compatible
                        ? "bg-gray-800/40 text-gray-600 cursor-not-allowed"
                        : selected
                        ? "text-white shadow-lg shadow-primary-500/10"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                    }
                  `}
                  style={
                    selected && compatible
                      ? { backgroundColor: chain.color + "33", borderColor: chain.color, border: `1px solid ${chain.color}`, color: chain.color }
                      : {}
                  }
                >
                  <span className="mr-1.5 font-bold">{chain.icon}</span>
                  {chain.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !address.trim() || selectedChains.length === 0}
        className="mt-6 w-full py-3.5 px-6 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/20 disabled:shadow-none"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Checking eligibility...
          </span>
        ) : (
          "Check Eligibility"
        )}
      </button>
    </form>
  );
}
