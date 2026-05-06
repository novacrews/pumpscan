export interface ScannerToken {
  // Core identity
  address: string;
  name: string;
  symbol: string;
  imageUrl?: string;

  // Price data
  priceUsd: number;
  priceChange5m: number;
  priceChange1h: number;
  priceChange6h: number;
  priceChange24h: number;

  // Volume
  volume5m: number;
  volume1h: number;
  volume6h: number;
  volume24h: number;

  // Liquidity & market
  liquidityUsd: number;
  marketCap: number;
  fdv: number;

  // Transactions
  buys5m: number;
  sells5m: number;
  buys1h: number;
  sells1h: number;
  buys24h: number;
  sells24h: number;

  // Pair info
  pairAddress: string;
  pairCreatedAt: number;
  dexUrl: string;
  dexId: string;

  // Risk / safety signals
  riskScore: number; // 0-100, higher = riskier
  riskFlags: RiskFlag[];
  safetyFlags: SafetyFlag[];

  // Holder analysis
  topHolderPct?: number; // top 10 holders as % of supply
  holderCount?: number;
  devHoldsPct?: number;

  // Social
  hasWebsite: boolean;
  hasTwitter: boolean;
  hasTelegram: boolean;
  description?: string;
  twitterUrl?: string;
  telegramUrl?: string;
  websiteUrl?: string;
}

export interface RiskFlag {
  type: RiskFlagType;
  label: string;
  severity: "low" | "medium" | "high" | "critical";
}

export type RiskFlagType =
  | "no_liquidity"
  | "low_liquidity"
  | "high_concentration"
  | "no_socials"
  | "very_new"
  | "sell_pressure"
  | "low_volume"
  | "pump_dump_pattern"
  | "single_holder_dominant"
  | "no_website"
  | "rapid_price_drop";

export interface SafetyFlag {
  type: SafetyFlagType;
  label: string;
}

export type SafetyFlagType =
  | "has_socials"
  | "healthy_distribution"
  | "good_liquidity"
  | "strong_volume"
  | "growing_holders"
  | "buy_pressure"
  | "established_age"
  | "verified_profile";

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
  | "pairCreatedAt"
  | "riskScore"
  | "buys5m";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  minLiquidity: number;
  minVolume24h: number;
  minMarketCap: number;
  maxAge: number; // hours, 0 = no limit
  maxRiskScore: number; // 0-100, 0 = no limit
  search: string;
  hideNoSocials: boolean;
  hideNoLiquidity: boolean;
  onlyBuyPressure: boolean;
}

export type ViewMode = "table" | "cards";
export type ScanMode = "new" | "trending" | "graduating" | "search";
