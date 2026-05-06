"use client";

import { useEffect, useState } from "react";
import { truncateAddress } from "@/lib/utils";

interface Holder {
  address: string;
  amount: number;
  pct: number;
  isWhale: boolean;
  label?: string;
}

interface WhaleData {
  address: string;
  totalSupply: number;
  holders: Holder[];
  top10Pct: number;
  whaleCount: number;
  concentrationRisk: "low" | "medium" | "high" | "critical";
}

const RISK_COLORS: Record<string, string> = {
  low: "#00ff88",
  medium: "#ffcc00",
  high: "#ff3355",
  critical: "#ff0040",
};

export default function WhaleTracker({ address }: { address: string }) {
  const [data, setData] = useState<WhaleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/whale/${address}`);
        if (res.ok) setData(await res.json());
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [address]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 justify-center">
        <div className="w-4 h-4 border border-accent-cyan border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-500">Loading holder data...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-xs text-gray-500 text-center py-4">
        Holder data unavailable — Solana RPC rate limited
      </p>
    );
  }

  const riskColor = RISK_COLORS[data.concentrationRisk];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-bg-primary rounded-lg p-3 text-center">
          <div className="text-lg font-bold" style={{ color: riskColor }}>
            {data.top10Pct.toFixed(1)}%
          </div>
          <div className="text-[9px] text-gray-500 uppercase mt-0.5">Top 10 Hold</div>
        </div>
        <div className="bg-bg-primary rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-accent-yellow">{data.whaleCount}</div>
          <div className="text-[9px] text-gray-500 uppercase mt-0.5">Whales (&gt;2%)</div>
        </div>
        <div className="bg-bg-primary rounded-lg p-3 text-center">
          <div
            className="text-sm font-bold uppercase"
            style={{ color: riskColor }}
          >
            {data.concentrationRisk}
          </div>
          <div className="text-[9px] text-gray-500 uppercase mt-0.5">Concentration</div>
        </div>
      </div>

      {/* Concentration bar */}
      <div>
        <div className="flex justify-between text-[9px] text-gray-500 mb-1">
          <span>Holder Concentration (top 10)</span>
          <span style={{ color: riskColor }}>{data.top10Pct.toFixed(1)}%</span>
        </div>
        <div className="h-2 rounded-full bg-bg-primary overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(data.top10Pct, 100)}%`,
              backgroundColor: riskColor,
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-gray-600 mt-1">
          <span>0%</span>
          <span className="text-accent-green">Healthy &lt;25%</span>
          <span className="text-accent-yellow">Medium 40%</span>
          <span className="text-accent-red">Danger 60%+</span>
        </div>
      </div>

      {/* Top holders list */}
      <div>
        <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">
          Top Holders
        </div>
        <div className="space-y-1">
          {data.holders.slice(0, 15).map((h, i) => (
            <div
              key={h.address}
              className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-bg-primary transition-colors"
            >
              <span className="text-[9px] text-gray-600 w-4">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <a
                    href={`https://solscan.io/account/${h.address}`}
                    target="_blank"
                    rel="noopener"
                    className="text-[10px] font-mono text-gray-400 hover:text-accent-cyan transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {h.label || truncateAddress(h.address, 6)}
                  </a>
                  {h.isWhale && (
                    <span className="text-[8px] px-1 py-0.5 rounded bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20">
                      🐋 WHALE
                    </span>
                  )}
                  {h.label && (
                    <span className="text-[8px] px-1 py-0.5 rounded bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
                      {h.label}
                    </span>
                  )}
                </div>
                <div className="h-1 rounded-full bg-bg-primary overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(h.pct * 3, 100)}%`,
                      backgroundColor: h.isWhale ? "#ffcc00" : "#2a2a45",
                    }}
                  />
                </div>
              </div>
              <span
                className="text-[10px] font-medium w-12 text-right"
                style={{ color: h.isWhale ? "#ffcc00" : "#888899" }}
              >
                {h.pct.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {data.holders.length === 0 && (
        <p className="text-xs text-gray-500 text-center py-4">
          No holder data available
        </p>
      )}
    </div>
  );
}
