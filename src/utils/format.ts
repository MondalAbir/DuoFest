const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const NUMBER = new Intl.NumberFormat("en-US");

const COMPACT = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number): string {
  return CURRENCY.format(value);
}

export function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000) return `$${COMPACT.format(value)}`;
  return CURRENCY.format(value);
}

export function formatNumber(value: number): string {
  return NUMBER.format(value);
}

export function formatCompact(value: number): string {
  return COMPACT.format(value);
}

export function formatDate(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeAgo(value: string): string {
  const then = new Date(value).getTime();
  const seconds = Math.floor((Date.now() - then) / 1000);
  const intervals: Array<[number, string]> = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secondsPer, label] of intervals) {
    const count = Math.floor(seconds / secondsPer);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function pad(value: number, length = 5): string {
  return String(value).padStart(length, "0");
}
