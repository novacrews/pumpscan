"use client";

interface TokenChartProps {
  address: string;
  pairAddress: string;
}

export default function TokenChart({ address, pairAddress }: TokenChartProps) {
  // DexScreener provides embeddable chart widgets
  const embedUrl = `https://dexscreener.com/solana/${pairAddress}?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15`;

  return (
    <div className="relative w-full rounded-lg overflow-hidden" style={{ height: "400px" }}>
      <iframe
        src={embedUrl}
        className="absolute inset-0 w-full h-full border-0"
        title={`Chart for ${address}`}
        allow="clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}
