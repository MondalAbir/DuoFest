export const COLORS = {
  primary: "#5B5CEB",
  primaryLight: "#8B5CF6",
  background: "#F8FAFC",
  card: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textSecondary: "#6B7280",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
} as const;

export const CHART_COLORS = {
  grid: "rgba(107, 114, 128, 0.16)",
  primary: COLORS.primary,
  primaryLight: COLORS.primaryLight,
  info: COLORS.info,
  success: COLORS.success,
  warning: COLORS.warning,
  danger: COLORS.danger,
} as const;

export const AVATAR_COLORS = [
  "#5B5CEB",
  "#8B5CF6",
  "#3B82F6",
  "#0EA5E9",
  "#10B981",
  "#F59E0B",
  "#F97316",
  "#EF4444",
  "#EC4899",
  "#14B8A6",
] as const;

export const CATEGORY_GRADIENTS: Record<string, string> = {
  Cultural: "from-violet-500 to-indigo-500",
  Technical: "from-blue-500 to-cyan-500",
  Sports: "from-emerald-500 to-teal-500",
  Music: "from-fuchsia-500 to-purple-500",
  Literary: "from-amber-500 to-orange-500",
  Dance: "from-rose-500 to-pink-500",
  Entrepreneurship: "from-indigo-500 to-blue-500",
  Workshop: "from-cyan-500 to-sky-500",
} as const;

export function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}
