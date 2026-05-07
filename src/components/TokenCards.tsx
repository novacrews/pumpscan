"use client";

import { useRouter } from "next/navigation";
import { ScannerToken, SortConfig, SortField } from "@/types/token";
import { formatPrice, formatVolume, formatPercent, formatAge, formatCompact } from "@/lib/utils";
import { RiskBadge } from "./RiskBadge";
import { getRiskLevel } from "@/lib/risk";

interface TokenCardsProps {
  tokens: ScannerToken[];
  loading: boolean;
}

function PricePill({ value }: { value: number }) {
  const cls = value > 0 ? "text-accent-green bg-accent-green/10 border-accent-green/20"
    : value < 0 ? "text-accent-red bg-accent-red/10 border-accent-red/20"
    : "text-gray-500 bg-bg-primary border-border";
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${cls}`}>
      {formatPercent(value)}
    </span>
  );
}

export default function TokenCards({ tokens, loading }: TokenCardsProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1">
                <div className="skeleton h-4 w-20 mb-1.5" />
                <div className="skeleton h-3 w-32" />
              </div>
            </div>
            <div className="skeleton h-3 w-full mb-2" />
            <div className="skeleton h-3 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-center px-4">
        <div>
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-gray-400 text-sm">No tokens found</p>
          <p className="text-gray-600 text-xs mt-1">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
      {tokens.map((token, i) => {
        const { color } = getRiskLevel(token.riskScore);
        const pumpUrl = `https://pump.fun/coin/${token.address}`;
        const total5m = token.buys5m + token.sells5m;
        const buyPct = total5m > 0 ? (token.buys5m / total5m) * 100 : 50;

        return (
          <div
            key={`${token.pairAddress}-${i}`}
            onClick={() => router.push(`/token/${token.address}`)}
            className="bg-bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-accent-cyan/30 active:scale-[0.98] transition-all animate-fade-in"
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                {token.imageUrl ? (
                  <img src={token.imageUrl} alt="" className="w-9 h-9 rounded-full flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-black">
                    {token.symbol.slice(0, 2)}
                  </div>
                )}
                <div>
                  <div className="font-bold text-white text-sm">{token.symbol}</div>
                  <div className="text-[9px] text-gray-500 truncate max-w-[120px]">{token.name}</div>
                </div>
              </div>
              <RiskBadge score={token.riskScore} compact />
            </div>

            {/* Price row */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="font-bold text-white">{formatPrice(token.priceUsd)}</div>
              <div className="flex items-center gap-1">
                <PricePill value={token.priceChange5m} />
                <PricePill value={token.priceChange1h} />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-2.5">
              <Stat label="Vol 5m" value={formatVolume(token.volume5m)} />
              <Stat label="Liq" value={token.liquidityUsd > 0 ? formatVolume(token.liquidityUsd) : "—"} accent={token.liquidityUsd > 5000} />
              <Stat label="MCap" value={token.marketCap > 0 ? `$${formatCompact(token.marketCap)}` : "—"} />
            </div>

            {/* Buy/sell bar */}
            {total5m > 0 && (
              <div className="mb-2.5">
                <div className="flex justify-between text-[9px] text-gray-600 mb-0.5">
                  <span className="text-accent-green">{token.buys5m} buys</span>
                  <span className="text-accent-red">{token.sells5m} sells</span>
                </div>
                <div className="h-1.5 rounded-full bg-accent-red/30 overflow-hidden">
                  <div className="h-full rounded-full bg-accent-green/80 transition-all"
                    style={{ width: `${buyPct}%` }} />
                </div>
              </div>
            )}

            {/* Footer row */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-[9px] text-gray-600">{formatAge(token.pairCreatedAt)} ago</span>
              <div className="flex items-center gap-2">
                {token.hasTwitter && (
                  <a href={token.twitterUrl} target="_blank" rel="noopener"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-gray-500 hover:text-accent-cyan">𝕏</a>
                )}
                {token.hasTelegram && (
                  <a href={token.telegramUrl} target="_blank" rel="noopener"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-gray-500 hover:text-accent-cyan">✈</a>
                )}
                <a href={pumpUrl} target="_blank" rel="noopener"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[9px] font-bold text-accent-green hover:text-white px-2 py-0.5 rounded border border-accent-green/30 bg-accent-green/10">
                  Trade ↗
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-bg-primary rounded-lg p-1.5 text-center">
      <div className="text-[8px] text-gray-600 uppercase">{label}</div>
      <div className={`text-[10px] font-medium mt-0.5 ${accent ? "text-accent-cyan" : "text-gray-300"}`}>{value}</div>
    </div>
  );
}
