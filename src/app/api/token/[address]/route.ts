import { NextResponse } from "next/server";
import { analyzeRisk } from "@/lib/risk";
import { ScannerToken } from "@/types/token";

const DEXSCREENER = "https://api.dexscreener.com";

async function safeFetch(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!address || address.length < 20) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  // Fetch pair data and profile in parallel
  const [pairsData, profilesData] = await Promise.all([
    safeFetch(`${DEXSCREENER}/latest/dex/tokens/${address}`),
    safeFetch(`${DEXSCREENER}/token-profiles/latest/v1`),
  ]);

  const pairs = pairsData?.pairs || [];
  const solanaPairs = pairs.filter(
    (p: { chainId: string }) => p.chainId === "solana"
  );

  if (solanaPairs.length === 0) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }

  // Pick best pair (highest liquidity)
  const pair = solanaPairs.reduce(
    (best: Record<string, unknown>, p: Record<string, unknown>) =>
      ((p.liquidity as { usd?: number })?.usd ?? 0) >
      ((best.liquidity as { usd?: number })?.usd ?? 0)
        ? p
        : best,
    solanaPairs[0]
  );

  // Find profile if available
  const profile = Array.isArray(profilesData)
    ? profilesData.find(
        (p: { chainId: string; tokenAddress: string }) =>
          p.chainId === "solana" && p.tokenAddress === address
      )
    : null;

  // Extract socials
  let hasWebsite = false,
    hasTwitter = false,
    hasTelegram = false;
  let twitterUrl, telegramUrl, websiteUrl, description;

  if (pair.info?.websites?.length) {
    hasWebsite = true;
    websiteUrl = pair.info.websites[0].url;
  }
  if (pair.info?.socials) {
    for (const s of pair.info.socials) {
      if (s.type === "twitter") {
        hasTwitter = true;
        twitterUrl = s.url;
      }
      if (s.type === "telegram") {
        hasTelegram = true;
        telegramUrl = s.url;
      }
    }
  }
  if (profile?.links) {
    for (const l of profile.links) {
      if (
        l.type === "twitter" ||
        l.url?.includes("twitter.com") ||
        l.url?.includes("x.com")
      ) {
        hasTwitter = true;
        twitterUrl = twitterUrl || l.url;
      }
      if (l.type === "telegram" || l.url?.includes("t.me")) {
        hasTelegram = true;
        telegramUrl = telegramUrl || l.url;
      }
      if (
        !l.type &&
        l.url &&
        !l.url.includes("twitter") &&
        !l.url.includes("x.com") &&
        !l.url.includes("t.me")
      ) {
        hasWebsite = true;
        websiteUrl = websiteUrl || l.url;
      }
    }
    description = profile.description;
  }

  const imageUrl =
    pair.info?.imageUrl ||
    (profile?.icon?.startsWith("http")
      ? profile.icon
      : profile?.icon
        ? `https://cdn.dexscreener.com/cms/images/${profile.icon}?width=64&height=64&fit=crop&quality=95&format=auto`
        : undefined);

  const token: ScannerToken = {
    address: pair.baseToken.address,
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    imageUrl,
    priceUsd: parseFloat(pair.priceUsd || "0") || 0,
    priceChange5m: pair.priceChange?.m5 ?? 0,
    priceChange1h: pair.priceChange?.h1 ?? 0,
    priceChange6h: pair.priceChange?.h6 ?? 0,
    priceChange24h: pair.priceChange?.h24 ?? 0,
    volume5m: pair.volume?.m5 ?? 0,
    volume1h: pair.volume?.h1 ?? 0,
    volume6h: pair.volume?.h6 ?? 0,
    volume24h: pair.volume?.h24 ?? 0,
    liquidityUsd: pair.liquidity?.usd ?? 0,
    marketCap: pair.marketCap ?? 0,
    fdv: pair.fdv ?? 0,
    buys5m: pair.txns?.m5?.buys ?? 0,
    sells5m: pair.txns?.m5?.sells ?? 0,
    buys1h: pair.txns?.h1?.buys ?? 0,
    sells1h: pair.txns?.h1?.sells ?? 0,
    buys24h: pair.txns?.h24?.buys ?? 0,
    sells24h: pair.txns?.h24?.sells ?? 0,
    pairAddress: pair.pairAddress,
    pairCreatedAt: pair.pairCreatedAt ?? Date.now(),
    dexUrl: pair.url,
    dexId: pair.dexId || "unknown",
    riskScore: 50,
    riskFlags: [],
    safetyFlags: [],
    hasWebsite,
    hasTwitter,
    hasTelegram,
    twitterUrl,
    telegramUrl,
    websiteUrl,
    description,
  };

  const risk = analyzeRisk(token);
  token.riskScore = risk.score;
  token.riskFlags = risk.riskFlags;
  token.safetyFlags = risk.safetyFlags;

  return NextResponse.json(token);
}
