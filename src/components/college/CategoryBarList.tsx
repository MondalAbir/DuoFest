import { motion } from "framer-motion";
import { categoryShares } from "@/data/college/analytics";
import { formatNumber } from "@/utils/format";

export function CategoryBarList() {
  const max = Math.max(...categoryShares.map((item) => item.value));

  return (
    <div className="space-y-5">
      {categoryShares.map((item, index) => (
        <div key={item.id} data-testid="category-bar">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.category}
            </span>
            <span className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-foreground">
                {formatNumber(item.value)}
              </span>
              <span className="w-10 text-right text-xs text-muted-foreground">
                {item.percent}%
              </span>
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              className="h-full rounded-full"
              style={{ backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
