import { TokenPair, ScannerToken } from "@/types/token";

const DEXSCREENER_BASE = "https://api.dexscreener.com/latest/dex";
const DEXSCREENER_TOKEN_PROFILES = "https://api.dexscreener.com/token-profiles/latest/v1";

function transformPairToToken(pair: TokenPair): ScannerToken {
  return {
    address: pair.baseToken.address,
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    priceUsd: parseFloat(pair.priceUsd) || 0,
    priceChange5m: pair.priceChange?.m5 ?? 0,
    priceChange1h: pair.priceChange?.h1 ?? 0,
    priceChange24h: pair.priceChange?.h24 ?? 0,
    volume5m: pair.volume?.m5 ?? 0,
    volume1h: pair.volume?.h1 ?? 0,
    volume24h: pair.volume?.h24 ?? 0,
    liquidityUsd: pair.liquidity?.usd ?? 0,
    marketCap: pair.marketCap ?? 0,
    fdv: pair.fdv ?? 0,
    buys5m: pair.txns?.m5?.buys ?? 0,
    sells5m: pair.txns?.m5?.sells ?? 0,
    buys1h: pair.txns?.h1?.buys ?? 0,
    sells1h: pair.txns?.h1?.sells ?? 0,
    pairAddress: pair.pairAddress,
    pairCreatedAt: pair.pairCreatedAt ?? Date.now(),
    dexUrl: pair.url,
    imageUrl: pair.info?.imageUrl,
  };
}

export async function fetchPumpFunTokens(): Promise<ScannerToken[]> {
  try {
    // Search for pump.fun tokens on Solana
    const response = await fetch(
      `${DEXSCREENER_BASE}/search?q=pump.fun`,
      {
        next: { revalidate: 0 },
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const data = await response.json();
    const pairs: TokenPair[] = data.pairs || [];

    // Filter to Solana + pump.fun pairs only
    const pumpPairs = pairs.filter(
      (p) =>
        p.chainId === "solana" &&
        (p.dexId === "pumpfun" ||
          p.url?.includes("pump") ||
          p.dexId?.includes("raydium"))
    );

    return pumpPairs.map(transformPairToToken);
  } catch (error) {
    console.error("Failed to fetch pump.fun tokens:", error);
    return [];
  }
}

export async function fetchTrendingTokens(): Promise<ScannerToken[]> {
  try {
    // Fetch trending/boosted tokens from DexScreener
    const response = await fetch(
      `${DEXSCREENER_BASE}/pairs/solana`,
      {
        next: { revalidate: 0 },
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const data = await response.json();
    const pairs: TokenPair[] = data.pairs || [];

    return pairs
      .filter((p) => p.chainId === "solana")
      .map(transformPairToToken);
  } catch (error) {
    console.error("Failed to fetch trending tokens:", error);
    return [];
  }
}

export async function fetchNewPairs(): Promise<ScannerToken[]> {
  try {
    const response = await fetch(
      `${DEXSCREENER_BASE}/pairs/solana?sort=pairAge&order=asc`,
      {
        next: { revalidate: 0 },
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const data = await response.json();
    const pairs: TokenPair[] = data.pairs || [];

    return pairs.map(transformPairToToken);
  } catch (error) {
    console.error("Failed to fetch new pairs:", error);
    return [];
  }
}

export async function searchTokens(query: string): Promise<ScannerToken[]> {
  try {
    const response = await fetch(
      `${DEXSCREENER_BASE}/search?q=${encodeURIComponent(query)}`,
      {
        next: { revalidate: 0 },
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const data = await response.json();
    const pairs: TokenPair[] = data.pairs || [];

    return pairs
      .filter((p) => p.chainId === "solana")
      .map(transformPairToToken);
  } catch (error) {
    console.error("Failed to search tokens:", error);
    return [];
  }
}
