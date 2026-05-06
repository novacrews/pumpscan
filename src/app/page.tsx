"use client";

import Header from "@/components/Header";
import Filters from "@/components/Filters";
import TokenTable from "@/components/TokenTable";
import { useTokens } from "@/hooks/useTokens";

export default function Home() {
  const {
    tokens, totalCount, filteredCount, loading, error,
    lastUpdated, sort, filters, setFilters, toggleSort, refresh,
  } = useTokens();

  return (
    <div className="min-h-screen flex flex-col">
      <Header totalCount={totalCount} filteredCount={filteredCount} lastUpdated={lastUpdated} />
      <Filters filters={filters} setFilters={setFilters} />

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm px-4 py-2 flex items-center justify-between">
          <span>⚠ {error}</span>
          <button onClick={refresh} className="text-xs underline hover:no-underline">Retry</button>
        </div>
      )}

      <main className="flex-1 max-w-[1600px] mx-auto w-full">
        <TokenTable tokens={tokens} sort={sort} toggleSort={toggleSort} loading={loading} />
      </main>

      <footer className="border-t border-border bg-bg-secondary py-3 px-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between text-[10px] text-gray-600">
          <div className="flex items-center gap-4">
            <span>PUMPSCAN.FUN</span>
            <span>•</span>
            <span>Data by DexScreener</span>
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
