"use client";

import { FilterConfig } from "@/types/token";
import { useState } from "react";

interface FiltersProps {
  filters: FilterConfig;
  setFilters: (filters: FilterConfig) => void;
  totalCount: number;
  filteredCount: number;
}

export default function Filters({ filters, setFilters, totalCount, filteredCount }: FiltersProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-border bg-bg-secondary/30">
      <div className="max-w-[1600px] mx-auto px-4 py-2">
        {/* Quick filters row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest mr-1">Filters</span>

          {/* Toggle buttons */}
          <FilterToggle
            label="🛡️ Has Socials"
            active={filters.hideNoSocials}
            onClick={() => setFilters({ ...filters, hideNoSocials: !filters.hideNoSocials })}
          />
          <FilterToggle
            label="💧 Has Liquidity"
            active={filters.hideNoLiquidity}
            onClick={() => setFilters({ ...filters, hideNoLiquidity: !filters.hideNoLiquidity })}
          />
          <FilterToggle
            label="📈 Buy Pressure"
            active={filters.onlyBuyPressure}
            onClick={() => setFilters({ ...filters, onlyBuyPressure: !filters.onlyBuyPressure })}
          />

          {/* Min Liquidity */}
          <select
            value={filters.minLiquidity}
            onChange={(e) => setFilters({ ...filters, minLiquidity: Number(e.target.value) })}
            className="bg-bg-card border border-border rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-accent-cyan"
          >
            <option value={0}>Any Liq</option>
            <option value={500}>Liq $500+</option>
            <option value={1000}>Liq $1K+</option>
            <option value={5000}>Liq $5K+</option>
            <option value={10000}>Liq $10K+</option>
            <option value={50000}>Liq $50K+</option>
          </select>

          {/* Max Risk */}
          <select
            value={filters.maxRiskScore}
            onChange={(e) => setFilters({ ...filters, maxRiskScore: Number(e.target.value) })}
            className="bg-bg-card border border-border rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-accent-cyan"
          >
            <option value={0}>Any Risk</option>
            <option value={30}>Safe Only (≤30)</option>
            <option value={50}>Low-Med (≤50)</option>
            <option value={70}>No Extreme (≤70)</option>
          </select>

          {/* Max Age */}
          <select
            value={filters.maxAge}
            onChange={(e) => setFilters({ ...filters, maxAge: Number(e.target.value) })}
            className="bg-bg-card border border-border rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-accent-cyan"
          >
            <option value={0}>Any Age</option>
            <option value={0.25}>{'<'} 15 min</option>
            <option value={1}>{'<'} 1 hour</option>
            <option value={6}>{'<'} 6 hours</option>
            <option value={24}>{'<'} 24 hours</option>
          </select>

          {/* Advanced toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-auto text-[10px] text-gray-500 hover:text-accent-cyan transition-colors"
          >
            {expanded ? "▲ Less" : "▼ More"}
          </button>

          {/* Active filter count */}
          {filteredCount !== totalCount && (
            <span className="text-[10px] text-accent-cyan">
              {filteredCount}/{totalCount}
            </span>
          )}
        </div>

        {/* Expanded filters */}
        {expanded && (
          <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Min Vol 24h</span>
              <select
                value={filters.minVolume24h}
                onChange={(e) => setFilters({ ...filters, minVolume24h: Number(e.target.value) })}
                className="bg-bg-card border border-border rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-accent-cyan"
              >
                <option value={0}>Any</option>
                <option value={1000}>$1K+</option>
                <option value={5000}>$5K+</option>
                <option value={10000}>$10K+</option>
                <option value={50000}>$50K+</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Min MCap</span>
              <select
                value={filters.minMarketCap}
                onChange={(e) => setFilters({ ...filters, minMarketCap: Number(e.target.value) })}
                className="bg-bg-card border border-border rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-accent-cyan"
              >
                <option value={0}>Any</option>
                <option value={10000}>$10K+</option>
                <option value={50000}>$50K+</option>
                <option value={100000}>$100K+</option>
                <option value={500000}>$500K+</option>
              </select>
            </div>

            <button
              onClick={() => setFilters({
                ...filters,
                minLiquidity: 0, minVolume24h: 0, minMarketCap: 0,
                maxAge: 0, maxRiskScore: 0,
                hideNoSocials: false, hideNoLiquidity: false, onlyBuyPressure: false,
              })}
              className="text-[10px] text-accent-red hover:text-red-400 transition-colors"
            >
              ✕ Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 text-[10px] rounded transition-all ${
        active
          ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30"
          : "bg-bg-card/50 text-gray-500 border border-border hover:border-gray-500"
      }`}
    >
      {label}
    </button>
  );
}
