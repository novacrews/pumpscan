"use client";

import { getRiskLevel } from "@/lib/risk";
import { RiskFlag, SafetyFlag } from "@/types/token";

interface RiskBadgeProps {
  score: number;
  compact?: boolean;
}

export function RiskBadge({ score, compact }: RiskBadgeProps) {
  const { label, color, bgColor } = getRiskLevel(score);

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
        style={{ color, backgroundColor: bgColor }}
      >
        {score}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10">
        {/* Circular gauge */}
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-bold tracking-wide" style={{ color }}>{label}</span>
    </div>
  );
}

interface RiskFlagsProps {
  riskFlags: RiskFlag[];
  safetyFlags: SafetyFlag[];
  maxShow?: number;
}

export function RiskFlags({ riskFlags, safetyFlags, maxShow = 3 }: RiskFlagsProps) {
  const sevColors: Record<string, string> = {
    critical: "#ff0040",
    high: "#ff3355",
    medium: "#ffcc00",
    low: "#88aacc",
  };

  return (
    <div className="flex flex-wrap gap-1">
      {riskFlags.slice(0, maxShow).map((f, i) => (
        <span
          key={`r-${i}`}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium"
          style={{
            color: sevColors[f.severity],
            backgroundColor: `${sevColors[f.severity]}15`,
            border: `1px solid ${sevColors[f.severity]}30`,
          }}
        >
          ⚠ {f.label}
        </span>
      ))}
      {safetyFlags.slice(0, Math.max(0, maxShow - riskFlags.length)).map((f, i) => (
        <span
          key={`s-${i}`}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium text-accent-green"
          style={{
            backgroundColor: "rgba(0,255,136,0.1)",
            border: "1px solid rgba(0,255,136,0.2)",
          }}
        >
          ✓ {f.label}
        </span>
      ))}
      {riskFlags.length + safetyFlags.length > maxShow && (
        <span className="text-[9px] text-gray-500">
          +{riskFlags.length + safetyFlags.length - maxShow} more
        </span>
      )}
    </div>
  );
}
