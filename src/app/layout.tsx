import type { Metadata, Viewport } from "next";
import MobileNav from "@/components/MobileNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "PumpScan — Real-Time Solana Token Scanner",
  description: "Track Pump.fun launches, whale movements, and token risk in real-time. AI risk scoring, Telegram alerts, and whale tracking for Solana degens.",
  keywords: ["pump.fun", "solana", "token scanner", "whale tracker", "crypto", "meme coins", "degen"],
  openGraph: {
    title: "PumpScan — Real-Time Solana Token Scanner",
    description: "AI-powered Pump.fun scanner with whale tracking, risk scoring & Telegram alerts",
    url: "https://pumpscan.fun",
    siteName: "PumpScan",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PumpScan — Real-Time Solana Token Scanner",
    description: "AI-powered Pump.fun scanner with whale tracking & risk scoring",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
      </head>
      <body className="antialiased min-h-screen">
        {children}
        <MobileNav />
      </body>
    </html>
  );
}
