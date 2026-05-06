export interface TokenPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
    header?: string;
    openGraph?: string;
    websites?: { label: string; url: string }[];
    socials?: { type: string; url: string }[];
  };
}

export interface ScannerToken {
  address: string;
  name: string;
  symbol: string;
  priceUsd: number;
  priceChange5m: number;
  priceChange1h: number;
  priceChange24h: number;
  volume5m: number;
  volume1h: number;
  volume24h: number;
  liquidityUsd: number;
  marketCap: number;
  fdv: number;
  buys5m: number;
  sells5m: number;
  buys1h: number;
  sells1h: number;
  pairAddress: string;
  pairCreatedAt: number;
  dexUrl: string;
  imageUrl?: string;
}

export type SortField =
  | "name"
  | "priceUsd"
  | "priceChange5m"
  | "priceChange1h"
  | "priceChange24h"
  | "volume5m"
  | "volume1h"
  | "volume24h"
  | "liquidityUsd"
  | "marketCap"
  | "pairCreatedAt";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  minLiquidity: number;
  minVolume24h: number;
  minMarketCap: number;
  maxAge: number; // hours
  search: string;
}
