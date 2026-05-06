import { ScannerToken, RiskFlag, SafetyFlag } from "@/types/token";

/**
 * Compute risk score (0-100) and flags for a token.
 * Higher score = riskier.
 */
export function analyzeRisk(token: ScannerToken): {
  score: number;
  riskFlags: RiskFlag[];
  safetyFlags: SafetyFlag[];
} {
  const riskFlags: RiskFlag[] = [];
  const safetyFlags: SafetyFlag[] = [];
  let score = 50; // Start neutral

  // === LIQUIDITY ===
  if (token.liquidityUsd === 0 || !token.liquidityUsd) {
    riskFlags.push({ type: "no_liquidity", label: "No Liquidity", severity: "critical" });
    score += 25;
  } else if (token.liquidityUsd < 1000) {
    riskFlags.push({ type: "low_liquidity", label: `Low Liq ($${token.liquidityUsd.toFixed(0)})`, severity: "high" });
    score += 15;
  } else if (token.liquidityUsd < 5000) {
    riskFlags.push({ type: "low_liquidity", label: `Thin Liq ($${token.liquidityUsd.toFixed(0)})`, severity: "medium" });
    score += 8;
  } else if (token.liquidityUsd >= 10000) {
    safetyFlags.push({ type: "good_liquidity", label: "Good Liquidity" });
    score -= 10;
  }

  // === AGE ===
  const ageMinutes = (Date.now() - token.pairCreatedAt) / 60000;
  if (ageMinutes < 5) {
    riskFlags.push({ type: "very_new", label: "< 5 min old", severity: "high" });
    score += 10;
  } else if (ageMinutes < 30) {
    riskFlags.push({ type: "very_new", label: "< 30 min old", severity: "medium" });
    score += 5;
  } else if (ageMinutes > 1440) {
    safetyFlags.push({ type: "established_age", label: "> 24h old" });
    score -= 5;
  }

  // === SELL PRESSURE ===
  const totalTxns5m = token.buys5m + token.sells5m;
  if (totalTxns5m > 5) {
    const sellRatio = token.sells5m / totalTxns5m;
    if (sellRatio > 0.7) {
      riskFlags.push({ type: "sell_pressure", label: `Heavy Sells (${Math.round(sellRatio * 100)}%)`, severity: "high" });
      score += 12;
    } else if (sellRatio < 0.35) {
      safetyFlags.push({ type: "buy_pressure", label: `Strong Buys (${Math.round((1 - sellRatio) * 100)}%)` });
      score -= 8;
    }
  }

  // === VOLUME ===
  if (token.volume24h > 50000) {
    safetyFlags.push({ type: "strong_volume", label: "High Volume" });
    score -= 5;
  } else if (token.volume1h < 100 && ageMinutes > 60) {
    riskFlags.push({ type: "low_volume", label: "Dead Volume", severity: "medium" });
    score += 8;
  }

  // === SOCIALS ===
  const hasSocials = token.hasTwitter || token.hasTelegram;
  if (!hasSocials && !token.hasWebsite) {
    riskFlags.push({ type: "no_socials", label: "No Socials", severity: "medium" });
    score += 8;
  } else if (hasSocials && token.hasWebsite) {
    safetyFlags.push({ type: "has_socials", label: "Verified Socials" });
    score -= 5;
  }

  // === PRICE ACTION ===
  if (token.priceChange5m < -30) {
    riskFlags.push({ type: "rapid_price_drop", label: `Dumping (${token.priceChange5m.toFixed(0)}% 5m)`, severity: "critical" });
    score += 15;
  } else if (token.priceChange1h < -50) {
    riskFlags.push({ type: "pump_dump_pattern", label: "Pump & Dump Pattern", severity: "high" });
    score += 12;
  }

  // === HOLDER CONCENTRATION ===
  if (token.topHolderPct && token.topHolderPct > 60) {
    riskFlags.push({ type: "high_concentration", label: `Top holders: ${token.topHolderPct.toFixed(0)}%`, severity: "high" });
    score += 15;
  } else if (token.topHolderPct && token.topHolderPct > 40) {
    riskFlags.push({ type: "high_concentration", label: `Concentrated: ${token.topHolderPct.toFixed(0)}%`, severity: "medium" });
    score += 8;
  } else if (token.topHolderPct && token.topHolderPct < 25) {
    safetyFlags.push({ type: "healthy_distribution", label: "Well Distributed" });
    score -= 5;
  }

  // === MARKET CAP vs LIQUIDITY ratio ===
  if (token.marketCap > 0 && token.liquidityUsd > 0) {
    const mcapLiqRatio = token.marketCap / token.liquidityUsd;
    if (mcapLiqRatio > 50) {
      riskFlags.push({ type: "low_liquidity", label: "MCap/Liq ratio extreme", severity: "high" });
      score += 10;
    }
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  return { score, riskFlags, safetyFlags };
}

export function getRiskLevel(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 80) return { label: "EXTREME", color: "#ff0040", bgColor: "rgba(255,0,64,0.15)" };
  if (score >= 60) return { label: "HIGH", color: "#ff3355", bgColor: "rgba(255,51,85,0.15)" };
  if (score >= 40) return { label: "MEDIUM", color: "#ffcc00", bgColor: "rgba(255,204,0,0.15)" };
  if (score >= 20) return { label: "LOW", color: "#00ff88", bgColor: "rgba(0,255,136,0.15)" };
  return { label: "SAFE", color: "#00f5ff", bgColor: "rgba(0,245,255,0.15)" };
}
