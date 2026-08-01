import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export function LandingLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === "/") {
      window.scrollTo(0, 0);
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
}
