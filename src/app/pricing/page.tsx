"use client";

import Link from "next/link";

const FREE_FEATURES = [
  "Real-time token scanner",
  "AI risk scoring",
  "Token detail pages",
  "Basic filters",
  "Pump.fun deep links",
  "Sentiment analysis",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Telegram price alerts",
  "Whale wallet tracking",
  "Volume spike alerts",
  "New token launch alerts",
  "Rug pull warnings",
  "API access (1000 req/day)",
  "Custom alert thresholds",
  "Priority support",
  "Early access to new features",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="border-b border-border bg-bg-secondary px-4 py-2">
        <div className="max-w-[900px] mx-auto flex items-center justify-between">
          <Link href="/" className="text-xs text-gray-400 hover:text-accent-cyan transition-colors">
            ← <span className="text-accent-cyan font-bold">PUMP</span><span className="text-white">SCAN</span>
          </Link>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">Simple Pricing</h1>
          <p className="text-gray-400 text-sm">Start free. Upgrade when you need the edge.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <div className="mb-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Free</div>
              <div className="text-3xl font-bold text-white">$0</div>
              <div className="text-xs text-gray-500 mt-1">Forever free</div>
            </div>
            <ul className="space-y-2.5 mb-8">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                  <span className="text-accent-cyan">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/login"
              className="block w-full py-2.5 text-center text-xs font-medium border border-border rounded-lg text-gray-400 hover:border-accent-cyan hover:text-accent-cyan transition-colors">
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-bg-card border border-accent-purple/40 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple border border-accent-purple/30 font-bold">
              POPULAR
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/5 to-accent-cyan/5 pointer-events-none" />
            <div className="relative">
              <div className="mb-6">
                <div className="text-xs text-accent-purple uppercase tracking-wider mb-1">⚡ Pro</div>
                <div className="flex items-end gap-2">
                  <div className="text-3xl font-bold text-white">$29</div>
                  <div className="text-xs text-gray-500 mb-1">/month</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">Cancel anytime</div>
              </div>
              <ul className="space-y-2.5 mb-8">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="text-accent-purple">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => alert("Stripe integration coming soon! Check back shortly.")}
                className="block w-full py-2.5 text-center text-xs font-bold bg-accent-purple text-white rounded-lg hover:bg-accent-purple/90 transition-colors"
              >
                Upgrade to Pro →
              </button>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-xl mx-auto">
          <h2 className="text-sm font-bold text-white mb-6 text-center">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "How does the free plan work?", a: "Full scanner access forever. No credit card needed." },
              { q: "What are Telegram alerts?", a: "Get instant DMs when tokens spike, dump, or whales enter. Pro subscribers get personal alerts." },
              { q: "Can I cancel anytime?", a: "Yes. No contracts, no commitments. Cancel in one click." },
              { q: "What's the API for?", a: "Build your own tools on top of PumpScan data. 1000 requests/day on Pro." },
            ].map(({ q, a }) => (
              <div key={q} className="bg-bg-card border border-border rounded-xl p-4">
                <div className="text-xs font-medium text-white mb-1">{q}</div>
                <div className="text-xs text-gray-500">{a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
