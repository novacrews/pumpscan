"use client";

import { ScanMode } from "@/types/token";

interface ScanTabsProps {
  mode: ScanMode;
  setMode: (mode: ScanMode) => void;
  searchQuery: string;
  onSearch: (q: string) => void;
}

const TABS: { mode: ScanMode; label: string; icon: string; desc: string }[] = [
  { mode: "new", label: "New", icon: "🆕", desc: "Latest launches" },
  { mode: "trending", label: "Trending", icon: "🔥", desc: "Boosted tokens" },
  { mode: "graduating", label: "Graduating", icon: "🎓", desc: "Near Raydium" },
];

export default function ScanTabs({ mode, setMode, searchQuery, onSearch }: ScanTabsProps) {
  return (
    <div className="border-b border-border bg-bg-secondary">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex items-center gap-1 pt-2">
          {TABS.map((tab) => (
            <button
              key={tab.mode}
              onClick={() => setMode(tab.mode)}
              className={`px-4 py-2.5 text-xs font-medium rounded-t-lg transition-all border-b-2 ${
                mode === tab.mode
                  ? "bg-bg-card text-accent-cyan border-accent-cyan"
                  : "text-gray-400 border-transparent hover:text-white hover:bg-bg-card/50"
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
              <span className="hidden sm:inline text-[10px] text-gray-500 ml-1.5">
                {tab.desc}
              </span>
            </button>
          ))}

          {/* Search tab */}
          <div className="ml-auto flex items-center gap-2 pb-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search any Solana token..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setMode("search");
                  }
                }}
                className="w-64 bg-bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-accent-cyan transition-colors"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 text-[10px]">
                ↵
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
