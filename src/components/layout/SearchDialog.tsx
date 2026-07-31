import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { CornerDownLeft, Search, SearchX } from "lucide-react";
import { allNavItems } from "@/config/navigation";
import { colleges } from "@/data/colleges";
import { events } from "@/data/events";
import { admins } from "@/data/admins";
import { formatDateShort } from "@/utils/format";
import { cn } from "@/utils/cn";

interface SearchResult {
  id: string;
  group: string;
  title: string;
  subtitle?: string;
  action: () => void;
  hint?: string;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      const timeout = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    const go = (path: string) => () => {
      onOpenChange(false);
      navigate(path);
    };

    const pageResults: SearchResult[] = allNavItems.map((item) => ({
      id: `page-${item.path}`,
      group: "Pages",
      title: item.label,
      action: go(item.path),
      hint: "Navigate",
    }));

    const collegeResults: SearchResult[] = colleges
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => ({
        id: `college-${c.id}`,
        group: "Colleges",
        title: c.name,
        subtitle: `${c.city}, ${c.state}`,
        action: go("/admin/colleges"),
        hint: "College",
      }));

    const eventResults: SearchResult[] = events
      .filter((e) => !q || e.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map((e) => ({
        id: `event-${e.id}`,
        group: "Events",
        title: e.name,
        subtitle: `${e.collegeName} · ${formatDateShort(e.date)}`,
        action: go("/admin/events"),
        hint: "Event",
      }));

    const adminResults: SearchResult[] = admins
      .filter((a) => !q || a.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map((a) => ({
        id: `admin-${a.id}`,
        group: "College Admins",
        title: a.name,
        subtitle: a.collegeName,
        action: go("/admin/admins"),
        hint: "Admin",
      }));

    if (!q) return [...pageResults];

    return [...pageResults, ...collegeResults, ...eventResults, ...adminResults];
  }, [query, navigate, onOpenChange]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((current) => Math.min(current + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && results[selectedIndex]) {
      results[selectedIndex].action();
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    for (const result of results) {
      const group = map.get(result.group) ?? [];
      group.push(result);
      map.set(result.group, group);
    }
    return Array.from(map.entries());
  }, [results]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Global search"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-glass"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, colleges, events, admins…"
                className="h-13 w-full bg-transparent py-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                aria-label="Search"
              />
              <kbd className="hidden shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">
                ESC
              </kbd>
            </div>

            <div className="scrollbar-thin max-h-[380px] overflow-y-auto p-2">
              {grouped.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <SearchX className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">
                    No results for “{query}”
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try a different keyword or browse the sidebar.
                  </p>
                </div>
              ) : (
                grouped.map(([group, items]) => (
                  <div key={group} className="mb-1.5 last:mb-0">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group}
                    </p>
                    {items.map((result, index) => {
                      const globalIndex = results.indexOf(result);
                      const selected = globalIndex === selectedIndex;
                      return (
                        <button
                          key={result.id}
                          type="button"
                          onClick={result.action}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                            selected ? "bg-muted" : "hover:bg-muted/60",
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-foreground">
                              {result.title}
                            </span>
                            {result.subtitle && (
                              <span className="block truncate text-xs text-muted-foreground">
                                {result.subtitle}
                              </span>
                            )}
                          </span>
                          <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                            {result.hint}
                            {selected && (
                              <CornerDownLeft className="h-3 w-3" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-medium">↑</kbd>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-medium">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-medium">↵</kbd>
                to select
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
