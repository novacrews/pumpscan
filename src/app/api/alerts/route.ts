import { NextResponse } from "next/server";

// In-memory alert state (resets on cold start — use DB in production)
interface AlertRule {
  id: string;
  tokenAddress?: string; // specific token, or undefined = any token
  type: AlertType;
  threshold: number;
  chatId: string;
  active: boolean;
  createdAt: number;
  lastFired?: number;
  cooldownMs: number;
}

type AlertType =
  | "price_up"       // % gain in 5m
  | "price_down"     // % drop in 5m
  | "volume_spike"   // volume 5m > threshold USD
  | "low_risk"       // risk score drops below threshold
  | "high_risk"      // risk score above threshold
  | "new_token"      // any new token on pump.fun
  | "liquidity_add"  // liquidity jumps by threshold %
  | "buy_pressure";  // buy ratio > threshold %

// Global in-memory store
const alertRules: Map<string, AlertRule> = new Map();
let alertsEnabled = false;
let botToken = "";
let defaultChatId = "";

export async function POST(request: Request) {
  const body = await request.json();

  if (body.action === "configure") {
    botToken = body.botToken || botToken;
    defaultChatId = body.chatId || defaultChatId;
    alertsEnabled = true;
    return NextResponse.json({ ok: true, message: "Alerts configured" });
  }

  if (body.action === "add_rule") {
    const rule: AlertRule = {
      id: crypto.randomUUID(),
      tokenAddress: body.tokenAddress,
      type: body.type,
      threshold: body.threshold,
      chatId: body.chatId || defaultChatId,
      active: true,
      createdAt: Date.now(),
      cooldownMs: body.cooldownMs || 300_000, // 5 min default
    };
    alertRules.set(rule.id, rule);
    return NextResponse.json({ ok: true, ruleId: rule.id, rule });
  }

  if (body.action === "remove_rule") {
    alertRules.delete(body.ruleId);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "test") {
    // Send a test alert
    if (!botToken || !defaultChatId) {
      return NextResponse.json({ error: "Not configured" }, { status: 400 });
    }
    await sendTelegramMessage(botToken, defaultChatId,
      "🔔 *PumpScan Alerts Active!*\n\nYour whale & price alerts are connected. You'll be notified of:\n• 🚀 Price spikes\n• 📉 Price dumps\n• 🐋 Whale entries\n• 💥 Volume spikes\n• 🆕 New tokens\n\n_PumpScan.fun_"
    );
    return NextResponse.json({ ok: true, message: "Test alert sent" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({
    enabled: alertsEnabled,
    ruleCount: alertRules.size,
    rules: Array.from(alertRules.values()),
  });
}

async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export const runtime = "nodejs";
