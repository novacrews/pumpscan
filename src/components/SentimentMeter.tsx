"use client";

import { useEffect, useState } from "react";

interface Signal {
  source: string;
  signal: "bullish" | "bearish" | "neutral";
  weight: number;
  label: string;
}

interface SentimentData {
  score: number;
  label: string;
  signals: Signal[];
  trending: boolean;
  updatedAt: number;
}

const LABEL_CONFIG: Record<string, { color: string; emoji: string; bg: string }> = {
  very_bullish: { color: "#00ff88", emoji: "🔥", bg: "rgba(0,255,136,0.1)" },
  bullish:      { color: "#00f5ff", emoji: "📈", bg: "rgba(0,245,255,0.1)" },
  neutral:      { color: "#888899", emoji: "😐", bg: "rgba(136,136,153,0.1)" },
  bearish:      { color: "#ffcc00", emoji: "📉", bg: "rgba(255,204,0,0.1)" },
  very_bearish: { color: "#ff3355", emoji: "💀", bg: "rgba(255,51,85,0.1)" },
};

export default function SentimentMeter({ address }: { address: string }) {
  const [data, setData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/sentiment/${address}`);
        if (res.ok) setData(await res.json());
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
  }, [address]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 justify-center">
        <div className="w-3 h-3 border border-accent-cyan border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] text-gray-500">Analyzing sentiment...</span>
      </div>
    );
  }

  if (!data) {
    return <p className="text-xs text-gray-500 text-center py-3">Sentiment unavailable</p>;
  }

  const cfg = LABEL_CONFIG[data.label] || LABEL_CONFIG.neutral;
  const barWidth = ((data.score + 100) / 200) * 100; // convert -100..100 → 0..100%
  const bullish = data.signals.filter(s => s.signal === "bullish");
  const bearish = data.signals.filter(s => s.signal === "bearish");

  return (
    <div className="space-y-4">
      {/* Score display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-xl flex flex-col items-center justify-center border"
            style={{ backgroundColor: cfg.bg, borderColor: `${cfg.color}30` }}
          >
            <span className="text-xl">{cfg.emoji}</span>
            <span className="text-[10px] font-bold" style={{ color: cfg.color }}>
              {data.score > 0 ? "+" : ""}{data.score}
            </span>
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: cfg.color }}>
              {data.label.replace("_", " ").toUpperCase()}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              Based on {data.signals.length} signals
            </div>
            {data.trending && (
              <div className="text-[9px] mt-1 px-1.5 py-0.5 rounded bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20 inline-block">
                🔥 TRENDING
              </div>
            )}
          </div>
        </div>
        <div className="text-[9px] text-gray-600">
          Updated {new Date(data.updatedAt).toLocaleTimeString()}
        </div>
      </div>

      {/* Sentiment bar */}
      <div>
        <div className="flex justify-between text-[9px] text-gray-500 mb-1">
          <span className="text-accent-red">Bearish</span>
          <span className="text-gray-600">Neutral</span>
          <span className="text-accent-green">Bullish</span>
        </div>
        <div className="h-3 rounded-full bg-gradient-to-r from-accent-red/20 via-bg-primary to-accent-green/20 relative overflow-hidden border border-border">
          <div className="absolute inset-0 flex items-center">
            <div
              className="absolute w-3 h-3 rounded-full border-2 border-white transition-all duration-700"
              style={{ left: `calc(${barWidth}% - 6px)`, backgroundColor: cfg.color }}
            />
          </div>
        </div>
      </div>

      {/* Signals breakdown */}
      <div className="grid grid-cols-2 gap-3">
        {/* Bullish signals */}
        <div>
          <div className="text-[9px] text-accent-green uppercase tracking-wider mb-1.5">
            📈 Bullish Signals ({bullish.length})
          </div>
          <div className="space-y-1">
            {bullish.length === 0 && (
              <p className="text-[10px] text-gray-600">None</p>
            )}
            {bullish.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-accent-green flex-shrink-0" />
                <span className="text-[10px] text-gray-400">{s.label}</span>
                <span className="text-[9px] text-accent-green ml-auto">+{s.weight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bearish signals */}
        <div>
          <div className="text-[9px] text-accent-red uppercase tracking-wider mb-1.5">
            📉 Bearish Signals ({bearish.length})
          </div>
          <div className="space-y-1">
            {bearish.length === 0 && (
              <p className="text-[10px] text-gray-600">None</p>
            )}
            {bearish.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-accent-red flex-shrink-0" />
                <span className="text-[10px] text-gray-400">{s.label}</span>
                <span className="text-[9px] text-accent-red ml-auto">-{s.weight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
