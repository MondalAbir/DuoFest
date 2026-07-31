import { useMemo } from "react";
import { useLocation } from "react-router";
import { motion } from "framer-motion";
import { Construction, Home } from "lucide-react";
import { collegeRouteTitles } from "@/config/collegeNavigation";
import { Button } from "@/components/ui/button";

function titleFromPath(path: string): string {
  const exact = collegeRouteTitles[path];
  if (exact) return exact;

  for (const [route, title] of Object.entries(collegeRouteTitles)) {
    if (route.endsWith("/:id") && path.startsWith(route.replace("/:id", ""))) {
      return title;
    }
  }
  return "Page";
}

export default function CollegePlaceholderPage() {
  const location = useLocation();
  const title = useMemo(() => titleFromPath(location.pathname), [location.pathname]);

  return (
    <motion.div
      data-testid="placeholder-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex min-h-[60vh] flex-col items-center justify-center text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted/50 shadow-card">
        <Construction className="h-7 w-7 text-muted-foreground" />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        This section of the College Portal is under construction. We're building
        it out for the {title.toLowerCase()} workspace — check back soon.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Button size="sm" variant="outline" asChild>
          <a href="/admin/college">
            <Home className="h-4 w-4" />
            Back to dashboard
          </a>
        </Button>
      </div>
    </motion.div>
  );
}
