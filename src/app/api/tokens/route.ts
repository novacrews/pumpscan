import { NextResponse } from "next/server";

const DEXSCREENER = "https://api.dexscreener.com";

// In-memory cache
let cache: { data: Record<string, unknown>[]; timestamp: number } = { data: [], timestamp: 0 };
const CACHE_TTL = 8_000; // 8 seconds

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
}

interface TokenProfile {
  chainId: string;
  tokenAddress: string;
  icon?: string;
  description?: string;
  links?: { type?: string; label?: string; url: string }[];
}

async function safeFetch(url: string): Promise<unknown> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function collectAllTokenAddresses(): Promise<{
  addresses: Set<string>;
  profiles: Map<string, TokenProfile>;
}> {
  const addresses = new Set<string>();
  const profiles = new Map<string, TokenProfile>();

  // Fire all discovery endpoints in parallel
  const [
    searchPumpfun,
    searchPump,
    boostsLatest,
    boostsTop,
    profilesLatest,
    profilesRecent,
    ctosLatest,
  ] = await Promise.all([
    safeFetch(`${DEXSCREENER}/latest/dex/search?q=pumpfun`),
    safeFetch(`${DEXSCREENER}/latest/dex/search?q=pump`),
    safeFetch(`${DEXSCREENER}/token-boosts/latest/v1`),
    safeFetch(`${DEXSCREENER}/token-boosts/top/v1`),
    safeFetch(`${DEXSCREENER}/token-profiles/latest/v1`),
    safeFetch(`${DEXSCREENER}/token-profiles/recent-updates/v1`),
    safeFetch(`${DEXSCREENER}/community-takeovers/latest/v1`),
  ]);

  // Extract pairs from search results
  for (const result of [searchPumpfun, searchPump]) {
    if (result && typeof result === "object" && "pairs" in result) {
      const pairs = (result as { pairs: DexPair[] }).pairs || [];
      for (const p of pairs) {
        if (p.chainId === "solana") {
          addresses.add(p.baseToken.address);
        }
      }
    }
  }

  // Extract from boosts
  for (const result of [boostsLatest, boostsTop]) {
    if (Array.isArray(result)) {
      for (const item of result) {
        if (item.chainId === "solana" && item.tokenAddress) {
          addresses.add(item.tokenAddress);
        }
      }
    }
  }

  // Extract from profiles
  for (const result of [profilesLatest, profilesRecent]) {
    if (Array.isArray(result)) {
      for (const item of result) {
        if (item.chainId === "solana" && item.tokenAddress) {
          addresses.add(item.tokenAddress);
          profiles.set(item.tokenAddress, item);
        }
      }
    }
  }

  // Extract from CTOs
  if (Array.isArray(ctosLatest)) {
    for (const item of ctosLatest) {
      if (item.chainId === "solana" && item.tokenAddress) {
        addresses.add(item.tokenAddress);
      }
    }
  }

  return { addresses, profiles };
}

async function fetchPairsForAddresses(addresses: string[]): Promise<DexPair[]> {
  const allPairs: DexPair[] = [];

  // DexScreener allows up to 30 comma-separated addresses per request
  const chunks: string[][] = [];
  for (let i = 0; i < addresses.length; i += 30) {
    chunks.push(addresses.slice(i, i + 30));
  }

  // Fetch all chunks in parallel (but limit to 3 concurrent to respect rate limits)
  const batchSize = 3;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((chunk) =>
        safeFetch(`${DEXSCREENER}/latest/dex/tokens/${chunk.join(",")}`)
      )
    );
    for (const result of results) {
      if (result && typeof result === "object" && "pairs" in result) {
        const pairs = (result as { pairs: DexPair[] }).pairs || [];
        allPairs.push(...pairs.filter((p) => p.chainId === "solana"));
      }
    }
    // Small delay between batches to respect rate limits
    if (i + batchSize < chunks.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return allPairs;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "new";
  const query = searchParams.get("q") || "";

  // Handle search separately
  if (mode === "search" && query) {
    const result = await safeFetch(
      `${DEXSCREENER}/latest/dex/search?q=${encodeURIComponent(query)}`
    );
    if (result && typeof result === "object" && "pairs" in result) {
      const pairs = (result as { pairs: DexPair[] }).pairs || [];
      return NextResponse.json({
        pairs: pairs.filter((p) => p.chainId === "solana"),
        source: "search",
        total: pairs.length,
      });
    }
    return NextResponse.json({ pairs: [], source: "search", total: 0 });
  }

  // Check cache for non-search requests
  if (Date.now() - cache.timestamp < CACHE_TTL && cache.data.length > 0) {
    return NextResponse.json(cache.data, {
      headers: { "X-Cache": "HIT", "X-Count": String(cache.data.length) },
    });
  }

  // Collect all unique token addresses from multiple sources
  const { addresses, profiles } = await collectAllTokenAddresses();

  // Now fetch full pair data for ALL discovered addresses
  const addressList = Array.from(addresses);
  const allPairs = await fetchPairsForAddresses(addressList);

  // Dedupe: keep best pair per token (highest liquidity)
  const bestPairs = new Map<string, DexPair>();
  for (const pair of allPairs) {
    const addr = pair.baseToken.address;
    const existing = bestPairs.get(addr);
    if (!existing || (pair.liquidity?.usd ?? 0) > (existing.liquidity?.usd ?? 0)) {
      bestPairs.set(addr, pair);
    }
  }

  // Also add pairs we got from search that might not be in batch results
  // (search results already have full pair data)
  for (const result of [
    await safeFetch(`${DEXSCREENER}/latest/dex/search?q=pumpfun`),
  ]) {
    if (result && typeof result === "object" && "pairs" in result) {
      const pairs = (result as { pairs: DexPair[] }).pairs || [];
      for (const p of pairs) {
        if (p.chainId === "solana" && !bestPairs.has(p.baseToken.address)) {
          bestPairs.set(p.baseToken.address, p);
        }
      }
    }
  }

  // Filter by mode
  let finalPairs = Array.from(bestPairs.values());

  if (mode === "new") {
    // Sort by creation time, newest first
    finalPairs.sort((a, b) => (b.pairCreatedAt ?? 0) - (a.pairCreatedAt ?? 0));
  } else if (mode === "trending") {
    // Sort by 24h volume
    finalPairs.sort((a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0));
  } else if (mode === "graduating") {
    // Filter for tokens near graduation (>$30K mcap on pumpfun)
    finalPairs = finalPairs
      .filter((p) => p.dexId === "pumpfun" && (p.marketCap ?? 0) > 20000)
      .sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0));
  }

  // Build response with enrichment
  const response = finalPairs.map((pair) => ({
    ...pair,
    _profile: profiles.get(pair.baseToken.address) || null,
  }));

  // Cache it
  cache = { data: response, timestamp: Date.now() };

  return NextResponse.json(response, {
    headers: {
      "X-Cache": "MISS",
      "X-Count": String(response.length),
      "X-Sources": `${addresses.size} unique addresses discovered`,
    },
  });
}
