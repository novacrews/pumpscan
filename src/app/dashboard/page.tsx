"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  plan: "free" | "pro";
  apiKey?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "me" }),
    })
      .then(r => r.json())
      .then(d => {
        if (!d.user) router.push("/login");
        else setUser(d.user);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/");
  };

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="border-b border-border bg-bg-secondary px-4 py-2">
        <div className="max-w-[900px] mx-auto flex items-center justify-between">
          <Link href="/" className="text-xs text-gray-400 hover:text-accent-cyan">
            ← <span className="text-accent-cyan font-bold">PUMP</span><span className="text-white">SCAN</span>
          </Link>
          <button onClick={logout} className="text-[10px] text-gray-500 hover:text-accent-red transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
            user.plan === "pro"
              ? "bg-accent-purple/15 text-accent-purple border-accent-purple/30"
              : "bg-bg-card text-gray-400 border-border"
          }`}>
            {user.plan === "pro" ? "⚡ PRO" : "FREE"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Quick links */}
          <Link href="/" className="bg-bg-card border border-border rounded-xl p-4 hover:border-accent-cyan/30 transition-colors">
            <div className="text-lg mb-1">📡</div>
            <div className="text-sm font-medium text-white">Token Scanner</div>
            <div className="text-[10px] text-gray-500">Live Pump.fun data</div>
          </Link>
          <Link href="/alerts" className="bg-bg-card border border-border rounded-xl p-4 hover:border-accent-cyan/30 transition-colors">
            <div className="text-lg mb-1">🔔</div>
            <div className="text-sm font-medium text-white">Alert Settings</div>
            <div className="text-[10px] text-gray-500">Configure your notifications</div>
          </Link>
        </div>

        {/* API Key */}
        {user.apiKey && (
          <div className="bg-bg-card border border-border rounded-xl p-5 mb-4">
            <h2 className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">API Key</h2>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-bg-primary rounded-lg px-3 py-2 text-xs text-accent-cyan font-mono truncate">
                {user.apiKey}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(user.apiKey!)}
                className="text-[10px] px-3 py-2 bg-bg-hover border border-border rounded-lg text-gray-400 hover:text-accent-cyan transition-colors whitespace-nowrap"
              >
                Copy
              </button>
            </div>
            <p className="text-[10px] text-gray-600 mt-2">
              Use in requests: <code className="text-accent-cyan">?apiKey=YOUR_KEY</code>
            </p>
          </div>
        )}

        {/* Upgrade CTA for free users */}
        {user.plan === "free" && (
          <Link href="/pricing" className="block">
            <div className="bg-gradient-to-r from-accent-purple/10 to-accent-cyan/10 border border-accent-purple/30 rounded-xl p-5 hover:border-accent-purple/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white mb-1">⚡ Upgrade to Pro</div>
                  <div className="text-xs text-gray-400">Get Telegram alerts, whale tracking, and API access</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-accent-purple">$29</div>
                  <div className="text-[10px] text-gray-500">/month</div>
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
