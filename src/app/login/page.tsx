"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <div className="border-b border-border bg-bg-secondary px-4 py-2">
        <div className="max-w-md mx-auto">
          <Link href="/" className="text-xs text-gray-400 hover:text-accent-cyan">
            ← <span className="text-accent-cyan font-bold">PUMP</span><span className="text-white">SCAN</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-2xl mx-auto mb-3">⚡</div>
            <h1 className="text-xl font-bold">
              <span className="text-accent-cyan">PUMP</span><span className="text-white">SCAN</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">Solana Token Intelligence</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-bg-card rounded-xl p-1 mb-6 border border-border">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  mode === m
                    ? "bg-accent-cyan/15 text-accent-cyan"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full mt-1 bg-bg-card border border-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent-cyan transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full mt-1 bg-bg-card border border-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent-cyan transition-colors"
              />
            </div>

            {error && (
              <div className="text-xs text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent-cyan text-black text-sm font-bold rounded-lg hover:bg-accent-cyan/90 transition-colors disabled:opacity-50"
            >
              {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-gray-600">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Premium teaser */}
          <Link href="/pricing" className="block">
            <div className="border border-accent-purple/30 bg-accent-purple/5 rounded-xl p-4 hover:bg-accent-purple/10 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-accent-purple">⚡ PRO</span>
                <span className="text-xs font-bold text-white">$29/mo</span>
              </div>
              <ul className="space-y-1">
                {["Real-time Telegram alerts", "Whale wallet tracking", "API access", "Priority support"].map(f => (
                  <li key={f} className="text-[10px] text-gray-400 flex items-center gap-1.5">
                    <span className="text-accent-purple">✓</span> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-[10px] text-accent-purple font-medium">View pricing →</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
