import { useCountUp } from "@/hooks/use-count-up";
import { formatNumber } from "@/utils/format";

interface StatCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: StatCounterProps) {
  const animated = useCountUp(value, { duration: 1600 });
  const formatted =
    decimals > 0 ? animated.toFixed(decimals) : formatNumber(Math.round(animated));

  return (
    <span className="font-bold tabular-nums tracking-tight">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
