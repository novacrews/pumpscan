import { ScannerToken, ScanMode } from "@/types/token";
import { analyzeRisk } from "./risk";

const DEXSCREENER = "https://api.dexscreener.com";

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
  profile?: {
    icon?: string;
    description?: string;
    links?: { type?: string; label?: string; url: string }[];
  };
}

interface TokenProfile {
  chainId: string;
  tokenAddress: string;
  url?: string;
  icon?: string;
  description?: string;
  links?: { type?: string; label?: string; url: string }[];
}

// Cache for token profiles (enrichment data)
let profileCache: Map<string, TokenProfile> = new Map();
let profileCacheTime = 0;
const PROFILE_CACHE_TTL = 60_000; // 1 min

function extractSocials(pair: DexPair, profile?: TokenProfile) {
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

function transformPair(pair: DexPair, profile?: TokenProfile): ScannerToken {
  const socials = extractSocials(pair, profile);
  const imageUrl = pair.info?.imageUrl || profile?.icon;

  const token: ScannerToken = {
    address: pair.baseToken.address,
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    imageUrl: imageUrl?.startsWith("http") ? imageUrl : imageUrl ? `https://cdn.dexscreener.com/cms/images/${imageUrl}?width=64&height=64&fit=crop&quality=95&format=auto` : undefined,
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

  // Run risk analysis
  const risk = analyzeRisk(token);
  token.riskScore = risk.score;
  token.riskFlags = risk.riskFlags;
  token.safetyFlags = risk.safetyFlags;

  return token;
}

async function fetchProfiles(): Promise<Map<string, TokenProfile>> {
  if (Date.now() - profileCacheTime < PROFILE_CACHE_TTL && profileCache.size > 0) {
    return profileCache;
  }
  try {
    const res = await fetch(`${DEXSCREENER}/token-profiles/latest/v1`, {
      cache: "no-store",
    });
    if (!res.ok) return profileCache;
    const data: TokenProfile[] = await res.json();
    const map = new Map<string, TokenProfile>();
    for (const p of data) {
      if (p.chainId === "solana") {
        map.set(p.tokenAddress, p);
      }
    }
    profileCache = map;
    profileCacheTime = Date.now();
    return map;
  } catch {
    return profileCache;
  }
}

export async function fetchTokens(mode: ScanMode, query?: string): Promise<ScannerToken[]> {
  try {
    // Fetch profiles for enrichment in parallel
    const profilesPromise = fetchProfiles();

    let pairs: DexPair[] = [];

    switch (mode) {
      case "new": {
        // Search for newest pumpfun tokens
        const res = await fetch(`${DEXSCREENER}/latest/dex/search?q=pumpfun`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          pairs = (data.pairs || []).filter(
            (p: DexPair) => p.chainId === "solana" && p.dexId === "pumpfun"
          );
        }
        break;
      }
      case "trending": {
        // Get boosted/trending tokens, then fetch their pairs
        const boostRes = await fetch(`${DEXSCREENER}/token-boosts/latest/v1`, {
          cache: "no-store",
        });
        if (boostRes.ok) {
          const boosts = await boostRes.json();
          const solanaAddresses = boosts
            .filter((b: { chainId: string }) => b.chainId === "solana")
            .map((b: { tokenAddress: string }) => b.tokenAddress)
            .slice(0, 30);

          // Batch fetch pairs (max 30 addresses per call)
          if (solanaAddresses.length > 0) {
            const tokenStr = solanaAddresses.join(",");
            const pairsRes = await fetch(
              `${DEXSCREENER}/latest/dex/tokens/${tokenStr}`,
              { cache: "no-store" }
            );
            if (pairsRes.ok) {
              const pairsData = await pairsRes.json();
              pairs = (pairsData.pairs || []).filter(
                (p: DexPair) => p.chainId === "solana"
              );
            }
          }
        }
        break;
      }
      case "graduating": {
        // Tokens about to graduate from pump.fun to Raydium
        // These have higher liquidity and are near the bonding curve threshold
        const res = await fetch(`${DEXSCREENER}/latest/dex/search?q=pumpfun`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          pairs = (data.pairs || [])
            .filter(
              (p: DexPair) =>
                p.chainId === "solana" &&
                p.dexId === "pumpfun" &&
                (p.marketCap ?? 0) > 30000
            )
            .sort((a: DexPair, b: DexPair) => (b.marketCap ?? 0) - (a.marketCap ?? 0));
        }
        break;
      }
      case "search": {
        if (!query) return [];
        const res = await fetch(
          `${DEXSCREENER}/latest/dex/search?q=${encodeURIComponent(query)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          pairs = (data.pairs || []).filter(
            (p: DexPair) => p.chainId === "solana"
          );
        }
        break;
      }
    }

    const profiles = await profilesPromise;

    // Dedupe by base token address (keep highest liquidity pair per token)
    const seen = new Map<string, DexPair>();
    for (const p of pairs) {
      const addr = p.baseToken.address;
      const existing = seen.get(addr);
      if (!existing || (p.liquidity?.usd ?? 0) > (existing.liquidity?.usd ?? 0)) {
        seen.set(addr, p);
      }
    }

    return Array.from(seen.values()).map((p) =>
      transformPair(p, profiles.get(p.baseToken.address))
    );
  } catch (error) {
    console.error(`Failed to fetch tokens (${mode}):`, error);
    return [];
  }
}
