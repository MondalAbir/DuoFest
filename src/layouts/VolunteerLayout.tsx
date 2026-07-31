import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { VolunteerSidebar } from "@/components/volunteer/VolunteerSidebar";
import { VolunteerBottomNav } from "@/components/volunteer/VolunteerBottomNav";
import { VolunteerTopbar } from "@/components/volunteer/VolunteerTopbar";

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
        className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8"
      >
        <Outlet />
      </motion.main>
    </AnimatePresence>
  );
}

export function VolunteerLayout() {
  const location = useLocation();
  const isScanPage = location.pathname.startsWith("/admin/volunteer/scan");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <VolunteerSidebar />
      <VolunteerBottomNav />

      <div className="flex min-h-screen flex-col lg:pl-[256px]">
        {!isScanPage && <VolunteerTopbar />}
        <div className="mx-auto w-full max-w-[1600px] flex-1">
          <AnimatedOutlet />
        </div>
      </div>
    </div>
  );
}
