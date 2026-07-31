import { NavLink } from "react-router";
import { QrCode } from "lucide-react";
import { VOLUNTEER_BOTTOM_NAV_ITEMS } from "@/config/volunteerNavigation";
import { cn } from "@/utils/cn";

export function VolunteerBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-safe backdrop-blur-lg lg:hidden"
      aria-label="Volunteer portal navigation"
    >
      <div className="grid grid-cols-4">
        {VOLUNTEER_BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isScan = item.path === "/admin/volunteer/scan";
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin/volunteer/dashboard"}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  "flex min-h-[56px] flex-col items-center justify-end gap-1 pt-2 text-[11px] font-medium transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground",
                  isScan && "relative -mt-7",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isScan ? (
                    <span
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-full border-4 border-card bg-gradient-to-br from-primary to-purple-500 text-white shadow-lg shadow-primary/30 transition-transform duration-200 active:scale-95",
                        isActive && "ring-2 ring-ring ring-offset-2 ring-offset-card",
                      )}
                    >
                      <QrCode className="h-6 w-6" />
                    </span>
                  ) : (
                    <Icon
                      className={cn(
                        "h-6 w-6 transition-transform duration-200",
                        isActive && "scale-110",
                      )}
                    />
                  )}
                  <span className="pb-1.5">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
