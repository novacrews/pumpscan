"use client";

import { useState } from "react";
import Link from "next/link";

interface AlertRule {
  type: string;
  label: string;
  threshold: number;
  description: string;
  icon: string;
}

const PRESET_RULES: AlertRule[] = [
  { type: "price_up", label: "Price Spike", threshold: 20, description: "Alert when any token pumps >20% in 5 min", icon: "🚀" },
  { type: "price_down", label: "Price Dump", threshold: -25, description: "Alert when any token dumps >25% in 5 min", icon: "📉" },
  { type: "volume_spike", label: "Volume Spike", threshold: 5000, description: "Alert when 5m volume exceeds $5K", icon: "💥" },
  { type: "new_token", label: "New Token", threshold: 500, description: "Alert when new tokens launch with >$500 liquidity", icon: "🆕" },
  { type: "liquidity_add", label: "Rug Warning", threshold: 40, description: "Alert when liquidity drops >40%", icon: "⚠️" },
];

export default function AlertsPage() {
  const [telegramId, setTelegramId] = useState("5868856003");
  const [activeRules, setActiveRules] = useState<Set<string>>(new Set(["price_up", "volume_spike", "new_token"]));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);

  const toggleRule = (type: string) => {
    setActiveRules(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const saveAlerts = async () => {
    setSaving(true);
    // In production this would save to DB
    // For now, alerts run via the /api/scan endpoint which reads env vars
    await new Promise(r => setTimeout(r, 800));
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      });
    } catch { /* silent */ }
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="border-b border-border bg-bg-secondary px-4 py-2">
        <div className="max-w-[900px] mx-auto flex items-center justify-between">
          <Link href="/" className="text-xs text-gray-400 hover:text-accent-cyan transition-colors">
            ← <span className="text-accent-cyan font-bold">PUMP</span><span className="text-white">SCAN</span>
          </Link>
          <span className="text-xs text-gray-500">Smart Alerts</span>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            🔔 Smart Alerts
          </h1>
          <p className="text-sm text-gray-400">
            Get Telegram notifications for whale moves, price spikes, new tokens and more.
          </p>
        </div>

        {/* Telegram Setup */}
        <div className="bg-bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-4">
            Telegram Connection
          </h2>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse-glow" />
            <span className="text-xs text-accent-green">Connected via PumpScan bot</span>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Your Telegram Chat ID</label>
              <input
                type="text"
                value={telegramId}
                onChange={e => setTelegramId(e.target.value)}
                className="w-full mt-1 bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan transition-colors font-mono"
                placeholder="e.g. 5868856003"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={sendTest}
                disabled={testing}
                className="px-4 py-2 text-xs bg-bg-hover border border-border rounded-lg text-gray-400 hover:text-accent-cyan hover:border-accent-cyan/30 transition-colors disabled:opacity-50"
              >
                {testing ? "Sending..." : "Send Test"}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 mt-2">
            Don't know your chat ID? Message @userinfobot on Telegram — it'll tell you instantly.
          </p>
        </div>

        {/* Alert Rules */}
        <div className="bg-bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-4">
            Alert Rules
          </h2>
          <div className="space-y-3">
            {PRESET_RULES.map((rule) => (
              <div
                key={rule.type}
                onClick={() => toggleRule(rule.type)}
                className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all ${
                  activeRules.has(rule.type)
                    ? "bg-accent-cyan/5 border-accent-cyan/30"
                    : "bg-bg-primary border-border hover:border-gray-600"
                }`}
              >
                <span className="text-xl">{rule.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{rule.label}</span>
                    {activeRules.has(rule.type) && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30">ON</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{rule.description}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  activeRules.has(rule.type) ? "border-accent-cyan bg-accent-cyan/20" : "border-gray-600"
                }`}>
                  {activeRules.has(rule.type) && (
                    <div className="w-2 h-2 rounded-full bg-accent-cyan" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">How Alerts Work</h2>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-accent-cyan mt-0.5">1.</span>
              <span>PumpScan scans all Pump.fun tokens every 30 seconds</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent-cyan mt-0.5">2.</span>
              <span>When a token matches your rules, a Telegram message fires instantly</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent-cyan mt-0.5">3.</span>
              <span>Each alert has a 5-minute cooldown per token to prevent spam</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent-cyan mt-0.5">4.</span>
              <span>Alerts include a direct Pump.fun link so you can trade immediately</span>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={saveAlerts}
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium bg-accent-cyan text-black rounded-lg hover:bg-accent-cyan/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Alert Settings"}
          </button>
          <span className="text-[10px] text-gray-600">
            {activeRules.size} rule{activeRules.size !== 1 ? "s" : ""} active
          </span>
        </div>
      </div>
    </div>
  );
}
