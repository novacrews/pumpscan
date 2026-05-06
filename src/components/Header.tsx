"use client";
import Link from "next/link";

interface HeaderProps {
  totalCount: number;
  filteredCount: number;
  lastUpdated: Date | null;
}

export default function Header({ totalCount, filteredCount, lastUpdated }: HeaderProps) {
  return (
    <header className="bg-bg-secondary border-b border-border">
      <div className="max-w-[1600px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-black font-bold text-base">
                ⚡
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-green animate-pulse-glow" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">
                <span className="text-accent-cyan text-glow-cyan">PUMP</span>
                <span className="text-white">SCAN</span>
                <span className="text-accent-purple text-xs ml-1 font-normal opacity-70">.fun</span>
              </h1>
              <p className="text-[9px] text-gray-600 tracking-[0.2em] uppercase mt-0.5">
                Solana Token Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-[10px]">
            <Link href="/alerts" className="text-gray-400 hover:text-accent-cyan transition-colors">🔔 Alerts</Link>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-glow" />
              <span className="text-accent-green font-medium">LIVE</span>
            </div>
            <div className="text-gray-400">
              <span className="text-accent-cyan font-bold">{filteredCount}</span>
              {filteredCount !== totalCount && (
                <span className="text-gray-600">/{totalCount}</span>
              )}
              <span className="ml-1">tokens</span>
            </div>
            {lastUpdated && (
              <div className="text-gray-600 hidden sm:block">
                {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
