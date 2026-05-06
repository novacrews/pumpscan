"use client";

import { ScannerToken, SortConfig, SortField } from "@/types/token";
import { formatPrice, formatVolume, formatPercent, formatAge, formatCompact } from "@/lib/utils";
import { RiskBadge, RiskFlags } from "./RiskBadge";

interface TokenTableProps {
  tokens: ScannerToken[];
  sort: SortConfig;
  toggleSort: (field: SortField) => void;
  loading: boolean;
}

function SortIcon({ field, sort }: { field: SortField; sort: SortConfig }) {
  if (sort.field !== field) return <span className="text-gray-600 ml-0.5 opacity-0 group-hover/th:opacity-100">↕</span>;
  return <span className="text-accent-cyan ml-0.5">{sort.direction === "desc" ? "↓" : "↑"}</span>;
}

function PriceCell({ value }: { value: number }) {
  const cls = value > 0 ? "text-accent-green" : value < 0 ? "text-accent-red" : "text-gray-500";
  return <span className={`font-medium ${cls}`}>{formatPercent(value)}</span>;
}

function TxnBar({ buys, sells }: { buys: number; sells: number }) {
  const total = buys + sells;
  if (total === 0) return <span className="text-gray-600">—</span>;
  const buyPct = (buys / total) * 100;
  const color = buyPct > 60 ? "bg-accent-green/70" : buyPct < 40 ? "bg-accent-red/70" : "bg-accent-yellow/70";
  return (
    <div className="flex items-center gap-1">
      <div className="w-12 h-1.5 rounded-full bg-bg-primary overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${buyPct}%` }} />
      </div>
      <span className="text-[9px] text-gray-500 whitespace-nowrap">
        <span className="text-accent-green">{buys}</span>/<span className="text-accent-red">{sells}</span>
      </span>
    </div>
  );
}

function SocialIcons({ token }: { token: ScannerToken }) {
  return (
    <div className="flex items-center gap-1">
      {token.hasTwitter && (
        <a href={token.twitterUrl} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()}
          className="text-[10px] text-gray-500 hover:text-accent-cyan" title="Twitter">𝕏</a>
      )}
      {token.hasTelegram && (
        <a href={token.telegramUrl} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()}
          className="text-[10px] text-gray-500 hover:text-accent-cyan" title="Telegram">✈</a>
      )}
      {token.hasWebsite && (
        <a href={token.websiteUrl} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()}
          className="text-[10px] text-gray-500 hover:text-accent-cyan" title="Website">🌐</a>
      )}
    </div>
  );
}

const COLUMNS: { label: string; field: SortField; align?: "right" | "center" }[] = [
  { label: "Token", field: "name" },
  { label: "Risk", field: "riskScore", align: "center" },
  { label: "Price", field: "priceUsd", align: "right" },
  { label: "5m", field: "priceChange5m", align: "right" },
  { label: "1h", field: "priceChange1h", align: "right" },
  { label: "24h", field: "priceChange24h", align: "right" },
  { label: "Vol 1h", field: "volume1h", align: "right" },
  { label: "Liq", field: "liquidityUsd", align: "right" },
  { label: "MCap", field: "marketCap", align: "right" },
  { label: "Age", field: "pairCreatedAt", align: "right" },
  { label: "Buys", field: "buys5m", align: "center" },
];

export default function TokenTable({ tokens, sort, toggleSort, loading }: TokenTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-accent-cyan/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-xs text-gray-500">Scanning Pump.fun...</span>
          <span className="text-[10px] text-gray-600">Real-time data loading</span>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-center">
        <div>
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-gray-400 text-sm">No tokens found</p>
          <p className="text-gray-600 text-xs mt-1">Try adjusting filters or switching scan mode</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="token-table w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-3 py-2.5 text-[9px] text-gray-600 uppercase tracking-wider font-medium w-8">#</th>
            {COLUMNS.map((col) => (
              <th
                key={col.field}
                onClick={() => toggleSort(col.field)}
                className={`group/th px-3 py-2.5 text-[9px] text-gray-600 uppercase tracking-wider font-medium cursor-pointer hover:text-accent-cyan transition-colors select-none ${
                  col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                }`}
              >
                {col.label}
                <SortIcon field={col.field} sort={sort} />
              </th>
            ))}
            <th className="px-3 py-2.5 text-[9px] text-gray-600 uppercase tracking-wider font-medium text-center">Flags</th>
            <th className="px-3 py-2.5 text-[9px] text-gray-600 uppercase tracking-wider font-medium text-center">Links</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, i) => (
            <tr
              key={`${token.pairAddress}-${i}`}
              className="border-b border-border/30 hover:bg-bg-hover/70 transition-colors cursor-pointer group"
              onClick={() => window.open(token.dexUrl, "_blank")}
            >
              <td className="px-3 py-2 text-gray-600 text-[10px]">{i + 1}</td>

              {/* Token */}
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  {token.imageUrl ? (
                    <img src={token.imageUrl} alt="" className="w-7 h-7 rounded-full flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-black">
                      {token.symbol.slice(0, 2)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-white group-hover:text-accent-cyan transition-colors truncate max-w-[120px]">
                      {token.symbol}
                    </div>
                    <div className="text-[9px] text-gray-500 truncate max-w-[120px]">{token.name}</div>
                  </div>
                </div>
              </td>

              {/* Risk Score */}
              <td className="px-3 py-2 text-center">
                <RiskBadge score={token.riskScore} compact />
              </td>

              {/* Price */}
              <td className="px-3 py-2 text-right font-medium text-white">{formatPrice(token.priceUsd)}</td>

              {/* Price Changes */}
              <td className="px-3 py-2 text-right"><PriceCell value={token.priceChange5m} /></td>
              <td className="px-3 py-2 text-right"><PriceCell value={token.priceChange1h} /></td>
              <td className="px-3 py-2 text-right"><PriceCell value={token.priceChange24h} /></td>

              {/* Volume */}
              <td className="px-3 py-2 text-right text-gray-400">{formatVolume(token.volume1h)}</td>

              {/* Liquidity */}
              <td className="px-3 py-2 text-right">
                <span className={token.liquidityUsd > 5000 ? "text-accent-cyan" : token.liquidityUsd > 0 ? "text-gray-400" : "text-accent-red"}>
                  {token.liquidityUsd > 0 ? formatVolume(token.liquidityUsd) : "—"}
                </span>
              </td>

              {/* MCap */}
              <td className="px-3 py-2 text-right text-gray-400">
                {token.marketCap > 0 ? `$${formatCompact(token.marketCap)}` : "—"}
              </td>

              {/* Age */}
              <td className="px-3 py-2 text-right text-gray-500">{formatAge(token.pairCreatedAt)}</td>

              {/* Buy/Sell */}
              <td className="px-3 py-2"><TxnBar buys={token.buys5m} sells={token.sells5m} /></td>

              {/* Risk Flags */}
              <td className="px-3 py-2">
                <RiskFlags riskFlags={token.riskFlags} safetyFlags={token.safetyFlags} maxShow={2} />
              </td>

              {/* Social Links */}
              <td className="px-3 py-2 text-center">
                <SocialIcons token={token} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
