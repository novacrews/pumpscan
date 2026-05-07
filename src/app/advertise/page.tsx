"use client";

import { useState } from "react";
import Link from "next/link";

const SLOTS = [
  {
    id: "banner",
    name: "Top Banner",
    price: 50,
    description: "Prime spot at the top of every page. Maximum visibility.",
    reach: "~10,000 daily impressions",
    icon: "🏆",
  },
  {
    id: "featured",
    name: "Featured Strip",
    price: 30,
    description: "Scrollable featured tokens bar below the header.",
    reach: "~6,000 daily impressions",
    icon: "⭐",
  },
  {
    id: "sidebar",
    name: "Scanner Sidebar",
    price: 15,
    description: "Sidebar placement on the main token scanner.",
    reach: "~3,000 daily impressions",
    icon: "📌",
  },
];

interface FormData {
  projectName: string;
  symbol: string;
  tokenAddress: string;
  tagline: string;
  website: string;
  twitterUrl: string;
  telegramUrl: string;
  logoUrl: string;
  slot: string;
  days: string;
  contactEmail: string;
}

const INITIAL: FormData = {
  projectName: "",
  symbol: "",
  tokenAddress: "",
  tagline: "",
  website: "",
  twitterUrl: "",
  telegramUrl: "",
  logoUrl: "",
  slot: "featured",
  days: "7",
  contactEmail: "",
};

export default function AdvertisePage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; totalPrice?: number } | null>(null);

  const selectedSlot = SLOTS.find(s => s.id === form.slot);
  const totalPrice = selectedSlot ? selectedSlot.price * parseInt(form.days || "1") : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({ ok: true, message: data.message, totalPrice: data.totalPrice });
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="border-b border-border bg-bg-secondary px-4 py-2">
        <div className="max-w-[900px] mx-auto flex items-center justify-between">
          <Link href="/" className="text-xs text-gray-400 hover:text-accent-cyan transition-colors">
            ← <span className="text-accent-cyan font-bold">PUMP</span><span className="text-white">SCAN</span>
          </Link>
          <span className="text-xs text-gray-500">Advertise</span>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-10">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white mb-2">📢 Advertise on PumpScan</h1>
          <p className="text-sm text-gray-400">
            Reach thousands of active Solana traders every day. List your token or project in front of real degens.
          </p>
        </div>

        {/* Ad Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {SLOTS.map(slot => (
            <div
              key={slot.id}
              onClick={() => setForm(f => ({ ...f, slot: slot.id }))}
              className={`bg-bg-card border rounded-xl p-4 cursor-pointer transition-all ${
                form.slot === slot.id
                  ? "border-accent-cyan/50 bg-accent-cyan/5"
                  : "border-border hover:border-gray-500"
              }`}
            >
              <div className="text-2xl mb-2">{slot.icon}</div>
              <div className="text-sm font-bold text-white mb-1">{slot.name}</div>
              <div className="text-accent-cyan font-bold text-lg mb-2">${slot.price}<span className="text-xs text-gray-500">/day</span></div>
              <p className="text-[10px] text-gray-400 mb-2">{slot.description}</p>
              <div className="text-[9px] text-gray-500">📊 {slot.reach}</div>
              {form.slot === slot.id && (
                <div className="mt-2 text-[9px] text-accent-cyan">✓ Selected</div>
              )}
            </div>
          ))}
        </div>

        {/* Success state */}
        {result?.ok ? (
          <div className="bg-accent-green/10 border border-accent-green/30 rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">✅</div>
            <h2 className="text-sm font-bold text-accent-green mb-2">Ad Submitted!</h2>
            <p className="text-xs text-gray-400 mb-1">{result.message}</p>
            {result.totalPrice && (
              <p className="text-xs text-white font-medium">Total: ${result.totalPrice}</p>
            )}
            <p className="text-[10px] text-gray-500 mt-4">
              Payment integration launching soon. We'll contact you at the email provided.
            </p>
            <button
              onClick={() => { setResult(null); setForm(INITIAL); }}
              className="mt-4 text-xs text-accent-cyan hover:underline"
            >
              Submit another ad
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={submit} className="bg-bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-bold text-white mb-6">Ad Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Field label="Project Name *" placeholder="My Token" value={form.projectName}
                onChange={v => setForm(f => ({ ...f, projectName: v }))} />
              <Field label="Symbol *" placeholder="TOKEN" value={form.symbol}
                onChange={v => setForm(f => ({ ...f, symbol: v.toUpperCase() }))} />
            </div>

            <div className="mb-4">
              <Field label="Tagline *" placeholder="🚀 The next 100x on Solana — join now!" value={form.tagline}
                onChange={v => setForm(f => ({ ...f, tagline: v }))} />
              <p className="text-[9px] text-gray-600 mt-1">Max 80 chars. Make it punchy.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Field label="Token Address" placeholder="Optional - Solana mint address" value={form.tokenAddress}
                onChange={v => setForm(f => ({ ...f, tokenAddress: v }))} />
              <Field label="Website" placeholder="https://yourtoken.fun" value={form.website}
                onChange={v => setForm(f => ({ ...f, website: v }))} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Field label="Twitter/X" placeholder="https://x.com/..." value={form.twitterUrl}
                onChange={v => setForm(f => ({ ...f, twitterUrl: v }))} />
              <Field label="Telegram" placeholder="https://t.me/..." value={form.telegramUrl}
                onChange={v => setForm(f => ({ ...f, telegramUrl: v }))} />
              <Field label="Logo URL" placeholder="https://..." value={form.logoUrl}
                onChange={v => setForm(f => ({ ...f, logoUrl: v }))} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Duration (days) *</label>
                <select
                  value={form.days}
                  onChange={e => setForm(f => ({ ...f, days: e.target.value }))}
                  className="w-full mt-1 bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan"
                >
                  {[1, 3, 7, 14, 30].map(d => (
                    <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
              <Field label="Contact Email *" placeholder="you@example.com" value={form.contactEmail} type="email"
                onChange={v => setForm(f => ({ ...f, contactEmail: v }))} />
            </div>

            {/* Price summary */}
            <div className="bg-bg-primary rounded-xl p-4 mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">{selectedSlot?.name} × {form.days} day{parseInt(form.days) > 1 ? "s" : ""}</div>
                <div className="text-[10px] text-gray-600 mt-0.5">${selectedSlot?.price}/day</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-accent-cyan">${totalPrice}</div>
                <div className="text-[9px] text-gray-500">total</div>
              </div>
            </div>

            {result && !result.ok && (
              <div className="text-xs text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-lg px-3 py-2 mb-4">
                {result.message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-accent-cyan text-black text-sm font-bold rounded-lg hover:bg-accent-cyan/90 transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : `Submit Ad — $${totalPrice}`}
            </button>
            <p className="text-[10px] text-gray-600 text-center mt-2">
              Payment link will be sent to your email. Ad goes live within 1 hour of payment.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = "text" }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1 bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-accent-cyan transition-colors"
      />
    </div>
  );
}
