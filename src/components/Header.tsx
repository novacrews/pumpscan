"use client";

interface HeaderProps {
  totalCount: number;
  filteredCount: number;
  lastUpdated: Date | null;
}

export default function Header({ totalCount, filteredCount, lastUpdated }: HeaderProps) {
  return (
    <header className="border-b border-border bg-bg-secondary">
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-black font-bold text-lg">
                P
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent-green animate-pulse-glow" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-accent-cyan text-glow-cyan">PUMP</span>
                <span className="text-white">SCAN</span>
                <span className="text-accent-purple text-xs ml-1 font-normal">.fun</span>
              </h1>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">
                Real-Time Token Scanner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse-glow" />
              <span className="text-gray-400">LIVE</span>
            </div>
            <div className="text-gray-400">
              <span className="text-accent-cyan font-semibold">{filteredCount}</span>
              {filteredCount !== totalCount && (
                <span className="text-gray-600"> / {totalCount}</span>
              )}
              {" "}tokens
            </div>
            {lastUpdated && (
              <div className="text-gray-600">
                Updated {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
