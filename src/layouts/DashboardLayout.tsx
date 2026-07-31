import { useCallback, useEffect, useState, Suspense } from "react";
import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { PageLoader } from "@/components/common/PageLoader";
import { cn } from "@/utils/cn";

const SIDEBAR_STORAGE_KEY = "duofest-sidebar-collapsed";

function getInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
}

function AnimatedOutlet() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="flex-1 p-4 sm:p-6 lg:p-8"
      >
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </motion.main>
    </AnimatePresence>
  );
}

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleCollapsed = useCallback(
    () => setCollapsed((current) => !current),
    [],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      <MobileSidebar
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
      />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[256px]",
        )}
      >
        <Topbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <div className="mx-auto w-full max-w-[1600px] flex-1">
          <AnimatedOutlet />
        </div>
        <footer className="px-6 pb-6 text-center text-xs text-muted-foreground lg:text-left">
          © 2026 DuoFest Inc. · Multi-college fest management platform
        </footer>
      </div>
    </div>
  );
}
