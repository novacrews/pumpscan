import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

export interface Ad {
  id: string;
  projectName: string;
  symbol: string;
  tokenAddress?: string;
  tagline: string;
  website?: string;
  twitterUrl?: string;
  telegramUrl?: string;
  logoUrl?: string;
  slot: "banner" | "featured" | "sidebar";
  status: "pending" | "active" | "expired";
  startDate: number;
  endDate: number;
  impressions: number;
  clicks: number;
  pricePaid: number;
  contactEmail: string;
  createdAt: number;
}

// In-memory ad store (replace with DB in production)
const ads = new Map<string, Ad>();

// Seed some demo ads so the marketplace isn't empty
const demoAds: Ad[] = [
  {
    id: "demo1",
    projectName: "PumpScan Pro",
    symbol: "PSCAN",
    tagline: "🔥 Get real-time alerts for every pump. Upgrade to Pro.",
    website: "https://pumpscan-one.vercel.app/pricing",
    slot: "banner",
    status: "active",
    startDate: Date.now(),
    endDate: Date.now() + 7 * 86400000,
    impressions: 0,
    clicks: 0,
    pricePaid: 0,
    contactEmail: "nova@pumpscan.fun",
    createdAt: Date.now(),
  },
];
demoAds.forEach(a => ads.set(a.id, a));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slot = searchParams.get("slot");
  const all = searchParams.get("all");

  const now = Date.now();
  let activeAds = Array.from(ads.values()).filter(
    a => a.status === "active" && a.endDate > now
  );

  if (slot) activeAds = activeAds.filter(a => a.slot === slot);

  // Track impression
  if (!all && activeAds.length > 0) {
    const ad = activeAds[0];
    ad.impressions++;
    ads.set(ad.id, ad);
  }

  if (all === "admin") {
    return NextResponse.json(Array.from(ads.values()));
  }

  return NextResponse.json(activeAds.slice(0, slot === "banner" ? 1 : 3));
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body.action === "click") {
    const ad = ads.get(body.id);
    if (ad) { ad.clicks++; ads.set(ad.id, ad); }
    return NextResponse.json({ ok: true });
  }

  if (body.action === "submit") {
    // Validate required fields
    const required = ["projectName", "symbol", "tagline", "slot", "contactEmail", "days"];
    for (const field of required) {
      if (!body[field]) return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }

    const SLOT_PRICES: Record<string, number> = {
      banner: 50,    // $50/day
      featured: 30,  // $30/day
      sidebar: 15,   // $15/day
    };

    const days = Math.min(Math.max(parseInt(body.days) || 1, 1), 30);
    const pricePerDay = SLOT_PRICES[body.slot] || 30;
    const totalPrice = days * pricePerDay;

    const ad: Ad = {
      id: crypto.randomUUID(),
      projectName: body.projectName,
      symbol: body.symbol.toUpperCase(),
      tokenAddress: body.tokenAddress,
      tagline: body.tagline,
      website: body.website,
      twitterUrl: body.twitterUrl,
      telegramUrl: body.telegramUrl,
      logoUrl: body.logoUrl,
      slot: body.slot,
      status: "pending", // Goes active after payment
      startDate: Date.now(),
      endDate: Date.now() + days * 86400000,
      impressions: 0,
      clicks: 0,
      pricePaid: totalPrice,
      contactEmail: body.contactEmail,
      createdAt: Date.now(),
    };

    ads.set(ad.id, ad);

    // In production: redirect to Stripe checkout
    // For now: auto-activate (demo mode)
    ad.status = "active";
    ads.set(ad.id, ad);

    return NextResponse.json({
      ok: true,
      adId: ad.id,
      totalPrice,
      message: `Ad submitted! $${totalPrice} for ${days} days. Payment integration coming soon.`,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
