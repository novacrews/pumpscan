"use client";

import { FilterConfig } from "@/types/token";

interface FiltersProps {
  filters: FilterConfig;
  setFilters: (filters: FilterConfig) => void;
}

const PRESETS = [
  { label: "All", minLiquidity: 0, minVolume24h: 0, minMarketCap: 0, maxAge: 0 },
  { label: "New (<1h)", minLiquidity: 0, minVolume24h: 0, minMarketCap: 0, maxAge: 1 },
  { label: "Hot", minLiquidity: 1000, minVolume24h: 5000, minMarketCap: 0, maxAge: 0 },
  { label: "High Liq", minLiquidity: 10000, minVolume24h: 0, minMarketCap: 0, maxAge: 0 },
  { label: "Big Cap", minLiquidity: 0, minVolume24h: 0, minMarketCap: 100000, maxAge: 0 },
];

export default function Filters({ filters, setFilters }: FiltersProps) {
  return (
    <div className="border-b border-border bg-bg-secondary/50">
      <div className="max-w-[1600px] mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              type="text"
              placeholder="Search name, symbol, or address..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-bg-card border border-border rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent-cyan transition-colors"
            />
          </div>

          <div className="flex items-center gap-1">
            {PRESETS.map((preset) => {
              const isActive =
                filters.minLiquidity === preset.minLiquidity &&
                filters.minVolume24h === preset.minVolume24h &&
                filters.minMarketCap === preset.minMarketCap &&
                filters.maxAge === preset.maxAge;

              return (
                <button
                  key={preset.label}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      minLiquidity: preset.minLiquidity,
                      minVolume24h: preset.minVolume24h,
                      minMarketCap: preset.minMarketCap,
                      maxAge: preset.maxAge,
                    })
                  }
                  className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                    isActive
                      ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40"
                      : "bg-bg-card text-gray-400 border border-border hover:border-accent-cyan/30"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">Min Liq</span>
            <select
              value={filters.minLiquidity}
              onChange={(e) => setFilters({ ...filters, minLiquidity: Number(e.target.value) })}
              className="bg-bg-card border border-border rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-accent-cyan"
            >
              <option value={0}>Any</option>
              <option value={500}>$500+</option>
              <option value={1000}>$1K+</option>
              <option value={5000}>$5K+</option>
              <option value={10000}>$10K+</option>
              <option value={50000}>$50K+</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
