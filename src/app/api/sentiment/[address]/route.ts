import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface SentimentResult {
  address: string;
  symbol: string;
  score: number; // -100 to +100
  label: "very_bullish" | "bullish" | "neutral" | "bearish" | "very_bearish";
  signals: SentimentSignal[];
  twitterMentions?: number;
  telegramActivity?: string;
  trending: boolean;
  updatedAt: number;
}

interface SentimentSignal {
  source: string;
  signal: "bullish" | "bearish" | "neutral";
  weight: number;
  label: string;
}

// Derive sentiment from on-chain + price data (no Twitter API needed)
function deriveSentiment(tokenData: {
  priceChange5m: number;
  priceChange1h: number;
  priceChange6h: number;
  priceChange24h: number;
  buys5m: number;
  sells5m: number;
  buys1h: number;
  sells1h: number;
  volume5m: number;
  volume1h: number;
  volume24h: number;
  liquidityUsd: number;
  marketCap: number;
  pairCreatedAt: number;
}): { score: number; signals: SentimentSignal[] } {
  const signals: SentimentSignal[] = [];
  let score = 0;

  // === Price momentum signals ===
  if (tokenData.priceChange5m > 10) {
    signals.push({ source: "price", signal: "bullish", weight: 20, label: `+${tokenData.priceChange5m.toFixed(1)}% in 5m` });
    score += 20;
  } else if (tokenData.priceChange5m > 3) {
    signals.push({ source: "price", signal: "bullish", weight: 10, label: `+${tokenData.priceChange5m.toFixed(1)}% in 5m` });
    score += 10;
  } else if (tokenData.priceChange5m < -10) {
    signals.push({ source: "price", signal: "bearish", weight: 20, label: `${tokenData.priceChange5m.toFixed(1)}% in 5m` });
    score -= 20;
  } else if (tokenData.priceChange5m < -3) {
    signals.push({ source: "price", signal: "bearish", weight: 10, label: `${tokenData.priceChange5m.toFixed(1)}% in 5m` });
    score -= 10;
  }

  if (tokenData.priceChange1h > 30) {
    signals.push({ source: "price", signal: "bullish", weight: 25, label: `+${tokenData.priceChange1h.toFixed(1)}% in 1h` });
    score += 25;
  } else if (tokenData.priceChange1h > 10) {
    signals.push({ source: "price", signal: "bullish", weight: 15, label: `+${tokenData.priceChange1h.toFixed(1)}% in 1h` });
    score += 15;
  } else if (tokenData.priceChange1h < -30) {
    signals.push({ source: "price", signal: "bearish", weight: 25, label: `${tokenData.priceChange1h.toFixed(1)}% in 1h` });
    score -= 25;
  } else if (tokenData.priceChange1h < -10) {
    signals.push({ source: "price", signal: "bearish", weight: 15, label: `${tokenData.priceChange1h.toFixed(1)}% in 1h` });
    score -= 15;
  }

  // === Buy pressure signals ===
  const total5m = tokenData.buys5m + tokenData.sells5m;
  if (total5m > 5) {
    const buyRatio = tokenData.buys5m / total5m;
    if (buyRatio > 0.7) {
      signals.push({ source: "txns", signal: "bullish", weight: 20, label: `${Math.round(buyRatio * 100)}% buys in 5m` });
      score += 20;
    } else if (buyRatio > 0.55) {
      signals.push({ source: "txns", signal: "bullish", weight: 8, label: `${Math.round(buyRatio * 100)}% buys in 5m` });
      score += 8;
    } else if (buyRatio < 0.35) {
      signals.push({ source: "txns", signal: "bearish", weight: 20, label: `${Math.round((1 - buyRatio) * 100)}% sells in 5m` });
      score -= 20;
    } else if (buyRatio < 0.45) {
      signals.push({ source: "txns", signal: "bearish", weight: 8, label: `${Math.round((1 - buyRatio) * 100)}% sells in 5m` });
      score -= 8;
    }
  }

  // === Volume signals ===
  if (tokenData.volume5m > 10000) {
    signals.push({ source: "volume", signal: "bullish", weight: 15, label: `High 5m volume ($${(tokenData.volume5m / 1000).toFixed(1)}K)` });
    score += 15;
  } else if (tokenData.volume5m > 2000) {
    signals.push({ source: "volume", signal: "bullish", weight: 8, label: `Active 5m volume` });
    score += 8;
  } else if (tokenData.volume5m < 100 && (Date.now() - tokenData.pairCreatedAt) > 3600000) {
    signals.push({ source: "volume", signal: "bearish", weight: 10, label: `Dead volume` });
    score -= 10;
  }

  // === Liquidity signals ===
  if (tokenData.liquidityUsd > 20000) {
    signals.push({ source: "liquidity", signal: "bullish", weight: 10, label: `Strong liquidity ($${(tokenData.liquidityUsd / 1000).toFixed(0)}K)` });
    score += 10;
  } else if (tokenData.liquidityUsd < 500) {
    signals.push({ source: "liquidity", signal: "bearish", weight: 10, label: `Very low liquidity` });
    score -= 10;
  }

  // === 24h trend ===
  if (tokenData.priceChange24h > 100) {
    signals.push({ source: "trend", signal: "bullish", weight: 10, label: `+${tokenData.priceChange24h.toFixed(0)}% 24h trend` });
    score += 10;
  } else if (tokenData.priceChange24h < -50) {
    signals.push({ source: "trend", signal: "bearish", weight: 10, label: `${tokenData.priceChange24h.toFixed(0)}% 24h trend` });
    score -= 10;
  }

  return { score: Math.max(-100, Math.min(100, score)), signals };
}

function getLabel(score: number): SentimentResult["label"] {
  if (score >= 50) return "very_bullish";
  if (score >= 20) return "bullish";
  if (score <= -50) return "very_bearish";
  if (score <= -20) return "bearish";
  return "neutral";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  // Fetch token data from DexScreener
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("DexScreener unavailable");

    const data = await res.json();
    const pairs = (data.pairs || []).filter(
      (p: { chainId: string }) => p.chainId === "solana"
    );

    if (!pairs.length) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    // Use best pair
    const pair = pairs.reduce(
      (best: Record<string, unknown>, p: Record<string, unknown>) =>
        ((p.liquidity as { usd?: number })?.usd ?? 0) >
        ((best.liquidity as { usd?: number })?.usd ?? 0)
          ? p
          : best,
      pairs[0]
    );

    const tokenData = {
      priceChange5m: pair.priceChange?.m5 ?? 0,
      priceChange1h: pair.priceChange?.h1 ?? 0,
      priceChange6h: pair.priceChange?.h6 ?? 0,
      priceChange24h: pair.priceChange?.h24 ?? 0,
      buys5m: pair.txns?.m5?.buys ?? 0,
      sells5m: pair.txns?.m5?.sells ?? 0,
      buys1h: pair.txns?.h1?.buys ?? 0,
      sells1h: pair.txns?.h1?.sells ?? 0,
      volume5m: pair.volume?.m5 ?? 0,
      volume1h: pair.volume?.h1 ?? 0,
      volume24h: pair.volume?.h24 ?? 0,
      liquidityUsd: pair.liquidity?.usd ?? 0,
      marketCap: pair.marketCap ?? 0,
      pairCreatedAt: pair.pairCreatedAt ?? Date.now(),
    };

    const { score, signals } = deriveSentiment(tokenData);
    const label = getLabel(score);
    const trending = Math.abs(score) > 40 && tokenData.volume5m > 1000;

    const result: SentimentResult = {
      address,
      symbol: pair.baseToken.symbol,
      score,
      label,
      signals,
      trending,
      updatedAt: Date.now(),
    };

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
