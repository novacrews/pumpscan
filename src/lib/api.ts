import { ScannerToken, ScanMode } from "@/types/token";
import { analyzeRisk } from "./risk";

interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceNative?: string;
  priceUsd?: string;
  txns?: {
    m5?: { buys: number; sells: number };
    h1?: { buys: number; sells: number };
    h6?: { buys: number; sells: number };
    h24?: { buys: number; sells: number };
  };
  volume?: { m5?: number; h1?: number; h6?: number; h24?: number };
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
  liquidity?: { usd?: number; base?: number; quote?: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  info?: {
    imageUrl?: string;
    websites?: { label: string; url: string }[];
    socials?: { type: string; url: string }[];
  };
  _profile?: {
    icon?: string;
    description?: string;
    links?: { type?: string; label?: string; url: string }[];
  };
}

function extractSocials(pair: DexPair) {
  let hasWebsite = false;
  let hasTwitter = false;
  let hasTelegram = false;
  let twitterUrl: string | undefined;
  let telegramUrl: string | undefined;
  let websiteUrl: string | undefined;
  let description: string | undefined;

  // From pair info
  if (pair.info?.websites?.length) {
    hasWebsite = true;
    websiteUrl = pair.info.websites[0].url;
  }
  if (pair.info?.socials) {
    for (const s of pair.info.socials) {
      if (s.type === "twitter") { hasTwitter = true; twitterUrl = s.url; }
      if (s.type === "telegram") { hasTelegram = true; telegramUrl = s.url; }
    }
  }

  // From profile enrichment
  const profile = pair._profile;
  if (profile) {
    description = profile.description;
    if (profile.links) {
      for (const l of profile.links) {
        if (l.type === "twitter" || l.url?.includes("twitter.com") || l.url?.includes("x.com")) {
          hasTwitter = true;
          twitterUrl = twitterUrl || l.url;
        }
        if (l.type === "telegram" || l.url?.includes("t.me")) {
          hasTelegram = true;
          telegramUrl = telegramUrl || l.url;
        }
        if (!l.type && l.url && !l.url.includes("twitter") && !l.url.includes("x.com") && !l.url.includes("t.me")) {
          hasWebsite = true;
          websiteUrl = websiteUrl || l.url;
        }
      }
    }
  }

  return { hasWebsite, hasTwitter, hasTelegram, twitterUrl, telegramUrl, websiteUrl, description };
}

function transformPair(pair: DexPair): ScannerToken {
  const socials = extractSocials(pair);
  const imageUrl = pair.info?.imageUrl || pair._profile?.icon;

  const token: ScannerToken = {
    address: pair.baseToken.address,
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    imageUrl: imageUrl?.startsWith("http")
      ? imageUrl
      : imageUrl
        ? `https://cdn.dexscreener.com/cms/images/${imageUrl}?width=64&height=64&fit=crop&quality=95&format=auto`
        : undefined,
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
    ...socials,
  };

  const risk = analyzeRisk(token);
  token.riskScore = risk.score;
  token.riskFlags = risk.riskFlags;
  token.safetyFlags = risk.safetyFlags;

  return token;
}

export async function fetchTokens(mode: ScanMode, query?: string): Promise<ScannerToken[]> {
  try {
    const params = new URLSearchParams({ mode });
    if (query) params.set("q", query);

    const res = await fetch(`/api/tokens?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();

    // Handle search response format
    if (data.pairs && data.source === "search") {
      return data.pairs.map(transformPair);
    }

    // Handle aggregated response (array of enriched pairs)
    if (Array.isArray(data)) {
      return data.map(transformPair);
    }

    return [];
  } catch (error) {
    console.error(`Failed to fetch tokens (${mode}):`, error);
    return [];
  }
}
