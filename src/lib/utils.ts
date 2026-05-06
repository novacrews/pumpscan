export function formatPrice(price: number): string {
  if (price === 0) return "$0.00";
  if (price < 0.000001) return `$${price.toExponential(2)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  if (price < 1000) return `$${price.toFixed(2)}`;
  return `$${formatCompact(price)}`;
}

export function formatCompact(num: number): string {
  if (num === 0) return "0";
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(2);
}

export function formatVolume(vol: number): string {
  if (vol === 0) return "$0";
  return `$${formatCompact(vol)}`;
}

export function formatPercent(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatAge(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mo`;
}

export function truncateAddress(addr: string, chars = 4): string {
  if (!addr) return "";
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
