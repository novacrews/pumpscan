"use client";

import { useEffect, useState } from "react";

interface Ad {
  id: string;
  projectName: string;
  symbol: string;
  tagline: string;
  website?: string;
  twitterUrl?: string;
  telegramUrl?: string;
  logoUrl?: string;
  slot: string;
}

function trackClick(id: string) {
  fetch("/api/ads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "click", id }),
  }).catch(() => {});
}

export function BannerAd() {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    fetch("/api/ads?slot=banner")
      .then(r => r.json())
      .then((ads: Ad[]) => ads.length > 0 && setAd(ads[0]))
      .catch(() => {});
  }, []);

  if (!ad) return null;

  return (
    <a
      href={ad.website || "#"}
      target="_blank"
      rel="noopener sponsored"
      onClick={() => trackClick(ad.id)}
      className="block border-b border-border bg-gradient-to-r from-accent-purple/5 via-bg-secondary to-accent-cyan/5 hover:from-accent-purple/10 hover:to-accent-cyan/10 transition-colors"
    >
      <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {ad.logoUrl ? (
            <img src={ad.logoUrl} alt={ad.symbol} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-[8px] font-bold text-black">
              {ad.symbol.slice(0, 2)}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-accent-purple font-bold uppercase">{ad.symbol}</span>
            <span className="text-[10px] text-gray-300">{ad.tagline}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {ad.twitterUrl && (
            <span
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); trackClick(ad.id); window.open(ad.twitterUrl, "_blank"); }}
              className="text-[9px] text-gray-500 hover:text-accent-cyan cursor-pointer"
            >𝕏</span>
          )}
          {ad.telegramUrl && (
            <span
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); trackClick(ad.id); window.open(ad.telegramUrl, "_blank"); }}
              className="text-[9px] text-gray-500 hover:text-accent-cyan cursor-pointer"
            >✈</span>
          )}
          <span className="text-[8px] text-gray-600 border border-gray-700 px-1.5 py-0.5 rounded">AD</span>
        </div>
      </div>
    </a>
  );
}

export function FeaturedAds() {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    fetch("/api/ads?slot=featured")
      .then(r => r.json())
      .then((data: Ad[]) => setAds(data))
      .catch(() => {});
  }, []);

  if (ads.length === 0) return null;

  return (
    <div className="border-b border-border bg-bg-secondary/30">
      <div className="max-w-[1600px] mx-auto px-4 py-2">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
          <span className="text-[8px] text-gray-600 uppercase tracking-widest whitespace-nowrap">Featured</span>
          {ads.map(ad => (
            <a
              key={ad.id}
              href={ad.website || "#"}
              target="_blank"
              rel="noopener sponsored"
              onClick={() => trackClick(ad.id)}
              className="flex items-center gap-1.5 px-3 py-1 bg-bg-card border border-border rounded-full text-[10px] text-gray-300 hover:border-accent-cyan/30 hover:text-accent-cyan transition-colors whitespace-nowrap"
            >
              {ad.logoUrl && <img src={ad.logoUrl} alt="" className="w-3.5 h-3.5 rounded-full" />}
              <span className="font-medium text-accent-yellow">{ad.symbol}</span>
              <span className="text-gray-500">–</span>
              <span>{ad.tagline.slice(0, 40)}{ad.tagline.length > 40 ? "..." : ""}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
