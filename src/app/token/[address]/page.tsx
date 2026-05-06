"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ScannerToken } from "@/types/token";
import { formatPrice, formatVolume, formatPercent, formatAge, formatCompact } from "@/lib/utils";
import { RiskBadge, RiskFlags } from "@/components/RiskBadge";
import { getRiskLevel } from "@/lib/risk";
import TokenChart from "@/components/TokenChart";

export default function TokenPage() {
  const params = useParams();
  const address = params.address as string;
  const [token, setToken] = useState<ScannerToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = useCallback(async () => {
    try {
      const res = await fetch(`/api/token/${address}`);
      if (!res.ok) throw new Error("Token not found");
      const data = await res.json();
      setToken(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load token");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchToken();
    const interval = setInterval(fetchToken, 15_000);
    return () => clearInterval(interval);
  }, [fetchToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-500">Loading token data...</span>
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-accent-red text-sm mb-2">⚠ {error || "Token not found"}</p>
          <Link href="/" className="text-xs text-accent-cyan hover:underline">← Back to Scanner</Link>
        </div>
      </div>
    );
  }

  const risk = getRiskLevel(token.riskScore);
  const pumpUrl = `https://pump.fun/coin/${token.address}`;
  const dexUrl = token.dexUrl || `https://dexscreener.com/solana/${token.address}`;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Top bar */}
      <div className="border-b border-border bg-bg-secondary px-4 py-2">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link href="/" className="text-xs text-gray-400 hover:text-accent-cyan transition-colors">
            ← <span className="text-accent-cyan font-bold">PUMP</span><span className="text-white">SCAN</span>
          </Link>
          <div className="flex items-center gap-2">
            <a href={pumpUrl} target="_blank" rel="noopener"
              className="px-3 py-1 text-[10px] font-bold bg-accent-green/15 text-accent-green border border-accent-green/30 rounded hover:bg-accent-green/25 transition-colors">
              Trade on Pump.fun ↗
            </a>
            <a href={dexUrl} target="_blank" rel="noopener"
              className="px-3 py-1 text-[10px] bg-bg-card text-gray-400 border border-border rounded hover:border-accent-cyan hover:text-accent-cyan transition-colors">
              DexScreener ↗
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Token Header */}
        <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
          <div className="flex items-center gap-4 flex-1">
            {token.imageUrl ? (
              <img src={token.imageUrl} alt={token.symbol} className="w-14 h-14 rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-lg font-bold text-black">
                {token.symbol.slice(0, 2)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{token.symbol}</h1>
                <RiskBadge score={token.riskScore} />
              </div>
              <p className="text-sm text-gray-400 mt-0.5">{token.name}</p>
              <p className="text-[10px] text-gray-600 mt-1 font-mono">{token.address}</p>
            </div>
          </div>

          {/* Price block */}
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{formatPrice(token.priceUsd)}</div>
            <div className="flex items-center justify-end gap-3 mt-1">
              <PriceTag label="5m" value={token.priceChange5m} />
              <PriceTag label="1h" value={token.priceChange1h} />
              <PriceTag label="6h" value={token.priceChange6h} />
              <PriceTag label="24h" value={token.priceChange24h} />
            </div>
          </div>
        </div>

        {/* Risk Flags */}
        <div className="mb-6">
          <RiskFlags riskFlags={token.riskFlags} safetyFlags={token.safetyFlags} maxShow={10} />
        </div>

        {/* Chart */}
        <div className="bg-bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs text-gray-400 uppercase tracking-wider font-medium">Price Chart</h2>
            <span className="text-[10px] text-gray-600">DexScreener Embed</span>
          </div>
          <TokenChart address={token.address} pairAddress={token.pairAddress} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Market Cap" value={token.marketCap > 0 ? `$${formatCompact(token.marketCap)}` : "—"} />
          <StatCard label="Liquidity" value={token.liquidityUsd > 0 ? formatVolume(token.liquidityUsd) : "—"}
            highlight={token.liquidityUsd > 10000 ? "cyan" : token.liquidityUsd > 0 ? undefined : "red"} />
          <StatCard label="FDV" value={token.fdv > 0 ? `$${formatCompact(token.fdv)}` : "—"} />
          <StatCard label="Age" value={formatAge(token.pairCreatedAt)} />
          <StatCard label="Vol 5m" value={formatVolume(token.volume5m)} />
          <StatCard label="Vol 1h" value={formatVolume(token.volume1h)} />
          <StatCard label="Vol 6h" value={formatVolume(token.volume6h)} />
          <StatCard label="Vol 24h" value={formatVolume(token.volume24h)} />
        </div>

        {/* Transactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <TxnCard label="5 Min" buys={token.buys5m} sells={token.sells5m} />
          <TxnCard label="1 Hour" buys={token.buys1h} sells={token.sells1h} />
        </div>

        {/* Risk Analysis */}
        <div className="bg-bg-card border border-border rounded-xl p-4 mb-6">
          <h2 className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-4">Risk Analysis</h2>
          <div className="flex items-center gap-6 mb-4">
            <RiskBadge score={token.riskScore} />
            <div className="flex-1">
              <div className="h-2 rounded-full bg-bg-primary overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${token.riskScore}%`, backgroundColor: risk.color }} />
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-gray-600">
                <span>SAFE</span><span>LOW</span><span>MEDIUM</span><span>HIGH</span><span>EXTREME</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {token.riskFlags.map((f, i) => (
              <div key={`r-${i}`} className="flex items-center gap-2 text-xs">
                <span className="text-accent-red">⚠</span>
                <span className="text-gray-300">{f.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-red/10 text-accent-red uppercase">{f.severity}</span>
              </div>
            ))}
            {token.safetyFlags.map((f, i) => (
              <div key={`s-${i}`} className="flex items-center gap-2 text-xs">
                <span className="text-accent-green">✓</span>
                <span className="text-gray-300">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Links & Socials */}
        <div className="bg-bg-card border border-border rounded-xl p-4">
          <h2 className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">Links</h2>
          <div className="flex flex-wrap gap-2">
            <LinkPill href={pumpUrl} label="Pump.fun" icon="🟢" />
            <LinkPill href={dexUrl} label="DexScreener" icon="📊" />
            <LinkPill href={`https://solscan.io/token/${token.address}`} label="Solscan" icon="🔍" />
            <LinkPill href={`https://birdeye.so/token/${token.address}?chain=solana`} label="Birdeye" icon="🦅" />
            {token.hasTwitter && token.twitterUrl && <LinkPill href={token.twitterUrl} label="Twitter" icon="𝕏" />}
            {token.hasTelegram && token.telegramUrl && <LinkPill href={token.telegramUrl} label="Telegram" icon="✈" />}
            {token.hasWebsite && token.websiteUrl && <LinkPill href={token.websiteUrl} label="Website" icon="🌐" />}
          </div>
          {token.description && (
            <p className="text-xs text-gray-400 mt-3 leading-relaxed border-t border-border/50 pt-3">
              {token.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PriceTag({ label, value }: { label: string; value: number }) {
  const cls = value > 0 ? "text-accent-green" : value < 0 ? "text-accent-red" : "text-gray-500";
  return (
    <div className="text-right">
      <div className="text-[9px] text-gray-600 uppercase">{label}</div>
      <div className={`text-xs font-medium ${cls}`}>{formatPercent(value)}</div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: "cyan" | "green" | "red" }) {
  const hlClass = highlight === "cyan" ? "text-accent-cyan" : highlight === "green" ? "text-accent-green" : highlight === "red" ? "text-accent-red" : "text-white";
  return (
    <div className="bg-bg-card border border-border rounded-lg p-3">
      <div className="text-[9px] text-gray-600 uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-bold mt-1 ${hlClass}`}>{value}</div>
    </div>
  );
}

function TxnCard({ label, buys, sells }: { label: string; buys: number; sells: number }) {
  const total = buys + sells;
  const buyPct = total > 0 ? (buys / total) * 100 : 50;
  return (
    <div className="bg-bg-card border border-border rounded-lg p-3">
      <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-2">{label} Transactions</div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-accent-green font-medium">{buys} Buys</span>
        <span className="text-accent-red font-medium">{sells} Sells</span>
      </div>
      <div className="h-2 rounded-full bg-accent-red/30 overflow-hidden">
        <div className="h-full rounded-full bg-accent-green/80 transition-all" style={{ width: `${buyPct}%` }} />
      </div>
    </div>
  );
}

function LinkPill({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a href={href} target="_blank" rel="noopener"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] bg-bg-hover border border-border rounded-lg text-gray-400 hover:text-accent-cyan hover:border-accent-cyan/30 transition-colors">
      <span>{icon}</span> {label} ↗
    </a>
  );
}
