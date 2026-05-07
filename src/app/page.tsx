"use client";

import { useState } from "react";
import Header from "@/components/Header";
import ScanTabs from "@/components/ScanTabs";
import Filters from "@/components/Filters";
import TokenTable from "@/components/TokenTable";
import TokenCards from "@/components/TokenCards";
import { BannerAd, FeaturedAds } from "@/components/AdBanner";
import { useTokens } from "@/hooks/useTokens";

export default function Home() {
  const {
    tokens, totalCount, filteredCount, loading, error,
    lastUpdated, sort, filters, setFilters, toggleSort,
    scanMode, setScanMode, searchQuery, doSearch, refresh,
  } = useTokens();

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header totalCount={totalCount} filteredCount={filteredCount} lastUpdated={lastUpdated} />
      <BannerAd />
      <ScanTabs mode={scanMode} setMode={setScanMode} searchQuery={searchQuery} onSearch={doSearch} />
      <FeaturedAds />
      <Filters filters={filters} setFilters={setFilters} totalCount={totalCount} filteredCount={filteredCount} />

      {/* View mode toggle + error */}
      <div className="max-w-[1600px] mx-auto w-full px-4 py-1.5 flex items-center justify-between">
        {error ? (
          <div className="text-accent-red text-xs flex items-center gap-2">
            <span>⚠ {error}</span>
            <button onClick={refresh} className="underline hover:no-underline">Retry</button>
          </div>
        ) : <div />}
        <div className="flex items-center gap-1 bg-bg-card border border-border rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("table")}
            className={`px-2.5 py-1 text-[10px] rounded transition-all ${viewMode === "table" ? "bg-accent-cyan/15 text-accent-cyan" : "text-gray-500 hover:text-gray-300"}`}
          >
            ☰ Table
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`px-2.5 py-1 text-[10px] rounded transition-all ${viewMode === "cards" ? "bg-accent-cyan/15 text-accent-cyan" : "text-gray-500 hover:text-gray-300"}`}
          >
            ⊞ Cards
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-[1600px] mx-auto w-full">
        {viewMode === "table" ? (
          <div className="overflow-x-auto table-scroll">
            <TokenTable tokens={tokens} sort={sort} toggleSort={toggleSort} loading={loading} />
          </div>
        ) : (
          <TokenCards tokens={tokens} loading={loading} />
        )}
      </main>

      <footer className="border-t border-border bg-bg-secondary py-3 px-4 pb-safe mt-auto">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2 text-[9px] text-gray-600">
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-400">PUMPSCAN.FUN</span>
            <span>•</span>
            <span>Data by DexScreener</span>
            <span>•</span>
            <a href="/advertise" className="hover:text-accent-yellow transition-colors">Advertise</a>
            <span>•</span>
            <a href="/pricing" className="hover:text-accent-purple transition-colors">Pro</a>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-glow" />
            <span>Live • @pumpsc4n</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
