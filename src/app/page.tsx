"use client";

import Header from "@/components/Header";
import ScanTabs from "@/components/ScanTabs";
import Filters from "@/components/Filters";
import TokenTable from "@/components/TokenTable";
import { BannerAd, FeaturedAds } from "@/components/AdBanner";
import { useTokens } from "@/hooks/useTokens";

export default function Home() {
  const {
    tokens, totalCount, filteredCount, loading, error,
    lastUpdated, sort, filters, setFilters, toggleSort,
    scanMode, setScanMode, searchQuery, doSearch, refresh,
  } = useTokens();

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header totalCount={totalCount} filteredCount={filteredCount} lastUpdated={lastUpdated} />

      <BannerAd />
      <ScanTabs
        mode={scanMode}
        setMode={setScanMode}
        searchQuery={searchQuery}
        onSearch={doSearch}
      />

      <FeaturedAds />
      <Filters
        filters={filters}
        setFilters={setFilters}
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

      {error && (
        <div className="bg-accent-red/10 border-b border-accent-red/20 text-accent-red text-xs px-4 py-2 flex items-center justify-between max-w-[1600px] mx-auto w-full">
          <span>⚠ {error}</span>
          <button onClick={refresh} className="text-[10px] underline hover:no-underline ml-4">Retry</button>
        </div>
      )}

      <main className="flex-1 max-w-[1600px] mx-auto w-full">
        <TokenTable tokens={tokens} sort={sort} toggleSort={toggleSort} loading={loading} />
      </main>

      <footer className="border-t border-border bg-bg-secondary py-2.5 px-4 mt-auto">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between text-[9px] text-gray-600">
          <div className="flex items-center gap-3">
            <span className="font-medium">PUMPSCAN.FUN</span>
            <span className="text-gray-700">•</span>
            <span>Real-time data by DexScreener</span>
            <span className="text-gray-700">•</span>
            <span>AI Risk Scoring</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-glow" />
            <span>Auto-refresh 10s</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
