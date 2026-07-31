import { useLocation, useNavigate } from "react-router";
import { ChevronRight, LogOut, Settings, UserRound } from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ADMIN = {
  name: "Adrian Cole",
  role: "Super Administrator",
  email: "adrian.duofest@admin.io",
  color: "#5B5CEB",
};

export function UserMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-xl border border-transparent p-1.5 transition-colors hover:border-border hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open account menu"
        >
          <UserAvatar name={ADMIN.name} color={ADMIN.color} />
          <span className="hidden text-left md:block">
            <span className="block text-sm font-semibold leading-tight text-foreground">
              {ADMIN.name}
            </span>
            <span className="block text-xs leading-tight text-muted-foreground">
              {ADMIN.role}
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-3 px-2.5 py-2">
          <UserAvatar name={ADMIN.name} color={ADMIN.color} size="lg" />
          <span>
            <span className="block text-sm font-semibold text-foreground">
              {ADMIN.name}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {ADMIN.email}
            </span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate("/admin/settings")}
          className="cursor-pointer"
        >
          <Settings />
          Account settings
          <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/admin/activity-logs")}
          className="cursor-pointer"
        >
          <UserRound />
          My activity
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate("/admin")}
          className="cursor-pointer text-danger focus:bg-danger/10 focus:text-danger"
        >
          <LogOut />
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ADMIN };
