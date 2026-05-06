import { NextResponse } from "next/server";

const DEXSCREENER = "https://api.dexscreener.com";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

// Track last seen tokens & prices to detect changes
let lastScanTokens: Map<string, {
  priceUsd: number;
  volume5m: number;
  liquidityUsd: number;
  riskScore: number;
}> = new Map();

let lastScanTime = 0;
const SCAN_COOLDOWN = 30_000; // 30 seconds between scans
let alertCooldowns: Map<string, number> = new Map();

async function sendAlert(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });
  } catch { /* silent */ }
}

function canAlert(key: string, cooldownMs = 300_000): boolean {
  const last = alertCooldowns.get(key) || 0;
  if (Date.now() - last < cooldownMs) return false;
  alertCooldowns.set(key, Date.now());
  return true;
}

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function formatPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

export async function GET() {
  // Rate limit scans
  if (Date.now() - lastScanTime < SCAN_COOLDOWN) {
    return NextResponse.json({ ok: true, message: "Cooldown active", nextScanIn: Math.ceil((SCAN_COOLDOWN - (Date.now() - lastScanTime)) / 1000) });
  }
  lastScanTime = Date.now();

  // Fetch fresh token data
  const res = await fetch(`${DEXSCREENER}/latest/dex/search?q=pumpfun`, { cache: "no-store" });
  if (!res.ok) return NextResponse.json({ error: "DexScreener unavailable" }, { status: 503 });

  const data = await res.json();
  const pairs = (data.pairs || []).filter((p: { chainId: string }) => p.chainId === "solana");

  const alerts: string[] = [];
  const newTokenAlerts: string[] = [];

  for (const pair of pairs) {
    const addr = pair.baseToken.address;
    const symbol = pair.baseToken.symbol;
    const name = pair.baseToken.name;
    const priceUsd = parseFloat(pair.priceUsd || "0") || 0;
    const volume5m = pair.volume?.m5 ?? 0;
    const liquidityUsd = pair.liquidity?.usd ?? 0;
    const priceChange5m = pair.priceChange?.m5 ?? 0;
    const priceChange1h = pair.priceChange?.h1 ?? 0;
    const buys5m = pair.txns?.m5?.buys ?? 0;
    const sells5m = pair.txns?.m5?.sells ?? 0;
    const marketCap = pair.marketCap ?? 0;
    const pairCreatedAt = pair.pairCreatedAt ?? 0;
    const pumpUrl = `https://pump.fun/coin/${addr}`;
    const ageMinutes = (Date.now() - pairCreatedAt) / 60000;

    const prev = lastScanTokens.get(addr);

    // 🆕 New token alert
    if (!prev && ageMinutes < 10 && liquidityUsd > 500) {
      if (canAlert(`new_${addr}`, 86_400_000)) {
        newTokenAlerts.push(
          `🆕 *New Token: ${symbol}*\n` +
          `${name}\n` +
          `💰 MCap: ${formatUsd(marketCap)} | 💧 Liq: ${formatUsd(liquidityUsd)}\n` +
          `[Pump.fun](${pumpUrl})`
        );
      }
    }

    if (prev) {
      // 🚀 Price spike alert (>20% in 5m)
      if (priceChange5m > 20 && canAlert(`spike_${addr}`)) {
        alerts.push(
          `🚀 *${symbol} PUMPING!*\n` +
          `${formatPct(priceChange5m)} in 5min | ${formatPct(priceChange1h)} in 1h\n` +
          `💰 MCap: ${formatUsd(marketCap)} | 💧 Liq: ${formatUsd(liquidityUsd)}\n` +
          `Vol 5m: ${formatUsd(volume5m)}\n` +
          `[Trade on Pump.fun](${pumpUrl})`
        );
      }

      // 📉 Dump alert (< -25% in 5m)
      if (priceChange5m < -25 && canAlert(`dump_${addr}`)) {
        alerts.push(
          `📉 *${symbol} DUMPING!*\n` +
          `${formatPct(priceChange5m)} in 5min\n` +
          `💧 Liq: ${formatUsd(liquidityUsd)} | MCap: ${formatUsd(marketCap)}\n` +
          `⚠️ Possible rug — check holders\n` +
          `[View on Pump.fun](${pumpUrl})`
        );
      }

      // 💥 Volume spike (5m vol > $5K)
      if (volume5m > 5000 && prev.volume5m < 1000 && canAlert(`vol_${addr}`)) {
        const buyRatio = (buys5m + sells5m) > 0 ? (buys5m / (buys5m + sells5m)) * 100 : 50;
        alerts.push(
          `💥 *${symbol} Volume Spike!*\n` +
          `5m Vol: ${formatUsd(volume5m)}\n` +
          `Buys/Sells: ${buys5m}/${sells5m} (${buyRatio.toFixed(0)}% buys)\n` +
          `${formatPct(priceChange5m)} in 5min\n` +
          `[Pump.fun](${pumpUrl})`
        );
      }

      // 💧 Liquidity warning (liq drops >40%)
      if (prev.liquidityUsd > 2000 && liquidityUsd < prev.liquidityUsd * 0.6 && canAlert(`liq_${addr}`)) {
        alerts.push(
          `⚠️ *${symbol} Liquidity Removed!*\n` +
          `Liq: ${formatUsd(prev.liquidityUsd)} → ${formatUsd(liquidityUsd)}\n` +
          `🚨 Possible rug pull\n` +
          `[Check Pump.fun](${pumpUrl})`
        );
      }
    }

    // Update state
    lastScanTokens.set(addr, { priceUsd, volume5m, liquidityUsd, riskScore: 50 });
  }

  // Send new token alerts (batch max 3)
  for (const alert of newTokenAlerts.slice(0, 3)) {
    await sendAlert(alert);
  }

  // Send price/volume alerts (batch max 5)
  for (const alert of alerts.slice(0, 5)) {
    await sendAlert(alert);
  }

  return NextResponse.json({
    ok: true,
    scanned: pairs.length,
    alertsSent: alerts.length + newTokenAlerts.length,
    newTokens: newTokenAlerts.length,
    priceAlerts: alerts.length,
    telegramConfigured: !!(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID),
  });
}
