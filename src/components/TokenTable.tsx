"use client";

import { ScannerToken, SortConfig, SortField } from "@/types/token";
import { formatPrice, formatVolume, formatPercent, formatAge, formatCompact } from "@/lib/utils";

interface TokenTableProps {
  tokens: ScannerToken[];
  sort: SortConfig;
  toggleSort: (field: SortField) => void;
  loading: boolean;
}

function SortIcon({ field, sort }: { field: SortField; sort: SortConfig }) {
  if (sort.field !== field) return <span className="text-gray-600 ml-1">↕</span>;
  return <span className="text-accent-cyan ml-1">{sort.direction === "desc" ? "↓" : "↑"}</span>;
}

function PriceChangeCell({ value }: { value: number }) {
  const cls = value > 0 ? "text-accent-green" : value < 0 ? "text-accent-red" : "text-gray-500";
  return <span className={`font-medium ${cls}`}>{formatPercent(value)}</span>;
}

function TxnRatio({ buys, sells }: { buys: number; sells: number }) {
  const total = buys + sells;
  const buyPct = total > 0 ? (buys / total) * 100 : 50;
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 rounded-full bg-bg-primary overflow-hidden">
        <div className="h-full rounded-full bg-accent-green/80" style={{ width: `${buyPct}%` }} />
      </div>
      <span className="text-[10px] text-gray-500">{buys}/{sells}</span>
    </div>
  );
}

const COLUMNS: { label: string; field: SortField; align?: string }[] = [
  { label: "Token", field: "name" },
  { label: "Price", field: "priceUsd", align: "right" },
  { label: "5m", field: "priceChange5m", align: "right" },
  { label: "1h", field: "priceChange1h", align: "right" },
  { label: "24h", field: "priceChange24h", align: "right" },
  { label: "Vol 5m", field: "volume5m", align: "right" },
  { label: "Vol 1h", field: "volume1h", align: "right" },
  { label: "Liq", field: "liquidityUsd", align: "right" },
  { label: "MCap", field: "marketCap", align: "right" },
  { label: "Age", field: "pairCreatedAt", align: "right" },
];

export default function TokenTable({ tokens, sort, toggleSort, loading }: TokenTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Scanning tokens...</span>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-center">
        <div>
          <p className="text-gray-400 text-sm">No tokens found</p>
          <p className="text-gray-600 text-xs mt-1">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="token-table w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-4 py-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium w-8">#</th>
            {COLUMNS.map((col) => (
              <th
                key={col.field}
                onClick={() => toggleSort(col.field)}
                className={`px-4 py-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium cursor-pointer hover:text-accent-cyan transition-colors ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {col.label}
                <SortIcon field={col.field} sort={sort} />
              </th>
            ))}
            <th className="px-4 py-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium text-center">Txns 5m</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, i) => (
            <tr
              key={`${token.pairAddress}-${i}`}
              className="border-b border-border/50 hover:bg-bg-hover transition-colors animate-fade-in cursor-pointer group"
              onClick={() => window.open(token.dexUrl, "_blank")}
            >
              <td className="px-4 py-3 text-gray-600">{i + 1}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {token.imageUrl ? (
                    <img src={token.imageUrl} alt={token.symbol} className="w-6 h-6 rounded-full"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-[8px] font-bold text-black">
                      {token.symbol.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-white group-hover:text-accent-cyan transition-colors">{token.symbol}</div>
                    <div className="text-[10px] text-gray-500">
                      {token.name.length > 20 ? `${token.name.slice(0, 20)}...` : token.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-medium">{formatPrice(token.priceUsd)}</td>
              <td className="px-4 py-3 text-right"><PriceChangeCell value={token.priceChange5m} /></td>
              <td className="px-4 py-3 text-right"><PriceChangeCell value={token.priceChange1h} /></td>
              <td className="px-4 py-3 text-right"><PriceChangeCell value={token.priceChange24h} /></td>
              <td className="px-4 py-3 text-right text-gray-400">{formatVolume(token.volume5m)}</td>
              <td className="px-4 py-3 text-right text-gray-400">{formatVolume(token.volume1h)}</td>
              <td className="px-4 py-3 text-right text-accent-cyan">{formatVolume(token.liquidityUsd)}</td>
              <td className="px-4 py-3 text-right text-gray-400">{token.marketCap > 0 ? `$${formatCompact(token.marketCap)}` : "—"}</td>
              <td className="px-4 py-3 text-right text-gray-500">{formatAge(token.pairCreatedAt)}</td>
              <td className="px-4 py-3"><TxnRatio buys={token.buys5m} sells={token.sells5m} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
