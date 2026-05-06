import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PumpScan — Real-Time Solana Token Scanner",
  description: "Track Pump.fun launches, whale movements, and token risk in real-time.",
  keywords: ["pump.fun", "solana", "token scanner", "whale tracker", "crypto"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
