import { useLocation, useNavigate } from "react-router";
import { LogOut, Settings, UserRound } from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { getAvatarColor } from "@/utils/constants";
import type { UserRole } from "@/lib/api/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Administrator",
  college_admin: "College Administrator",
  event_manager: "Event Manager",
  volunteer: "Volunteer",
  student: "Student",
};

export function CollegeUserMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, roles, logout } = useAuth();

  const name = user?.name ?? "Guest";
  const email = user?.email ?? "";
  const role = (roles[0] as UserRole | undefined) ?? "student";
  const roleLabel = ROLE_LABELS[role] ?? role;
  const color = getAvatarColor(user?.id ?? 0);

  const handleLogout = async () => {
    await logout();
    navigate("/login", {
      state: { from: location.pathname },
      replace: true,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-xl border border-transparent p-1.5 transition-colors hover:border-border hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open account menu"
        >
          <UserAvatar name={name} color={color} />
          <span className="hidden text-left lg:block">
            <span className="block text-sm font-semibold leading-tight text-foreground">
              {name}
            </span>
            <span className="block text-xs leading-tight text-muted-foreground">
              {roleLabel}
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-3 px-2.5 py-2">
          <UserAvatar name={name} color={color} size="lg" />
          <span>
            <span className="block text-sm font-semibold text-foreground">
              {name}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {email}
            </span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate("/college/profile")}
          className="cursor-pointer"
        >
          <UserRound />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/college/settings")}
          className="cursor-pointer"
        >
          <Settings />
          Account settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-danger focus:bg-danger/10 focus:text-danger"
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
