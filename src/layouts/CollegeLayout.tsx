import { useCallback, useEffect, useState, Suspense } from "react";
import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { CollegeSidebar } from "@/components/college/CollegeSidebar";
import { CollegeMobileSidebar } from "@/components/college/CollegeMobileSidebar";
import { CollegeTopbar } from "@/components/college/CollegeTopbar";
import { CollegeSearchDialog } from "@/components/college/CollegeSearchDialog";
import { PageLoader } from "@/components/common/PageLoader";
import { cn } from "@/utils/cn";

const SIDEBAR_STORAGE_KEY = "duofest-college-sidebar-collapsed";

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

export function CollegeLayout() {
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
      <CollegeSidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      <CollegeMobileSidebar
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
      />
      <CollegeSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[256px]",
        )}
      >
        <CollegeTopbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <div className="mx-auto w-full max-w-[1600px] flex-1">
          <AnimatedOutlet />
        </div>
        <footer className="px-6 pb-6 text-center text-xs text-muted-foreground lg:text-left">
          © 2026 DuoFest · Version 2.0.0
        </footer>
      </div>
    </div>
  );
}
