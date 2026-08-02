import { NavLink, useNavigate } from "react-router";
import { LogOut, QrCode } from "lucide-react";
import { VOLUNTEER_NAV_ITEMS } from "@/config/volunteerNavigation";
import { useAuth } from "@/context/AuthContext";
import { useVolunteerProfile, useAssignedEvents } from "@/lib/hooks";
import { getAvatarColor } from "@/utils/constants";
import { Logo } from "@/components/common/Logo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/cn";

export function VolunteerSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: profile } = useVolunteerProfile();
  const { data: assignedEvents } = useAssignedEvents();

  const assignment = assignedEvents?.[0];
  const event = assignment?.event;
  const displayName = profile?.user?.name ?? user?.name ?? "";
  const userId = profile?.user?.id ?? user?.id ?? 0;

  const handleLogout = async () => {
    await logout();
    navigate("/login/volunteer");
  };

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-[256px] flex-col border-r border-sidebar-border bg-sidebar lg:flex"
      aria-label="Volunteer portal sidebar"
    >
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-4">
        <Logo subtitle="Volunteer Portal" />
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
          Menu
        </p>
        <ul className="space-y-1">
          {VOLUNTEER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/volunteer/dashboard"}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                      "text-sidebar-muted hover:bg-sidebar-active-bg hover:text-sidebar-active",
                      isActive && "bg-sidebar-active-bg text-sidebar-active",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" />
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-sidebar-active" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {event && (
          <>
            <Separator className="my-4" />

            <div className="rounded-xl border border-border bg-card p-3.5 shadow-card">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <QrCode className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {event.title}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {assignment?.role ?? "No gate"} ·{" "}
                    {assignment?.shift_start_at
                      ? new Date(assignment.shift_start_at).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2">
          <UserAvatar
            name={displayName}
            color={getAvatarColor(userId)}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              VLD-{String(userId).padStart(4, "0")}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors duration-200 hover:bg-danger/10"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
