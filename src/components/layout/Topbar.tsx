import { useMemo } from "react";
import { useLocation } from "react-router";
import { ChevronRight, Menu, Search } from "lucide-react";
import { motion } from "framer-motion";
import { routeTitles } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { NotificationsMenu } from "@/components/dashboard/NotificationsMenu";
import { UserMenu } from "./UserMenu";
import { cn } from "@/utils/cn";

interface TopbarProps {
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  className?: string;
}

function Breadcrumbs() {
  const location = useLocation();
  const crumbs = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const segments = parts.length === 0 ? [""] : parts;
    return segments.map((segment, index) => {
      const path = "/" + parts.slice(0, index + 1).join("/");
      const isLast = index === segments.length - 1;
      return {
        label: routeTitles[path] ?? segment.replace(/-/g, " "),
        path,
        isLast,
      };
    });
  }, [location.pathname]);

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm">
        <li className="hidden items-center gap-1.5 sm:flex">
          <span className="text-muted-foreground">Admin</span>
          <ChevronSeparator />
        </li>
        {crumbs.map((crumb) => (
          <li
            key={crumb.path}
            className="flex min-w-0 items-center gap-1.5"
            aria-current={crumb.isLast ? "page" : undefined}
          >
            {!crumb.isLast && <ChevronSeparator />}
            <span
              className={cn(
                "truncate capitalize",
                crumb.isLast
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {crumb.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ChevronSeparator() {
  return (
    <ChevronRight
      className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50"
      aria-hidden="true"
    />
  );
}

export function Topbar({
  onOpenMobileSidebar,
  onOpenSearch,
  className,
}: TopbarProps) {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border px-4 sm:px-6",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenMobileSidebar}
        className="lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSearch}
          className="h-9 w-9 gap-2 px-0 sm:w-56 sm:justify-start sm:px-3"
          aria-label="Open global search"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="hidden text-sm font-normal text-muted-foreground sm:inline">
            Search anything…
          </span>
          <kbd className="ml-auto hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">
            ⌘K
          </kbd>
        </Button>

        <ThemeToggle />
        <NotificationsMenu />
        <UserMenu />
      </div>
    </motion.header>
  );
}
