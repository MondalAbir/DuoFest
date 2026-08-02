import { Activity } from "lucide-react";
import { useActivityLogs } from "@/lib/hooks";
import { adaptActivityEntry } from "@/lib/adapters";
import { PlatformTimeline } from "./PlatformTimeline";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";

export function PlatformActivityWidget() {
  const { data, isLoading } = useActivityLogs({ perPage: 6 });
  const items = (data?.items ?? []).map(adaptActivityEntry);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
            <Activity className="h-4 w-4 text-primary" />
            Platform Activity
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Live feed of what's happening
          </p>
        </div>
        <Link
          to="/admin/activity-logs"
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          Logs
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="flex-1">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-8 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <PlatformTimeline items={items.slice(0, 6)} />
        )}
      </div>
    </div>
  );
}
