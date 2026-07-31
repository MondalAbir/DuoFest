import { useNavigate } from "react-router";
import { LogOut, Settings, UserRound } from "lucide-react";
import { COLLEGE_ADMIN } from "@/data/college/dashboard";
import { UserAvatar } from "@/components/common/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CollegeUserMenu() {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-xl border border-transparent p-1.5 transition-colors hover:border-border hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open account menu"
        >
          <UserAvatar name={COLLEGE_ADMIN.name} color={COLLEGE_ADMIN.color} />
          <span className="hidden text-left lg:block">
            <span className="block text-sm font-semibold leading-tight text-foreground">
              {COLLEGE_ADMIN.name}
            </span>
            <span className="block text-xs leading-tight text-muted-foreground">
              {COLLEGE_ADMIN.role}
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-3 px-2.5 py-2">
          <UserAvatar name={COLLEGE_ADMIN.name} color={COLLEGE_ADMIN.color} size="lg" />
          <span>
            <span className="block text-sm font-semibold text-foreground">
              {COLLEGE_ADMIN.name}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {COLLEGE_ADMIN.email}
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
          onClick={() => navigate("/admin/college")}
          className="cursor-pointer text-danger focus:bg-danger/10 focus:text-danger"
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
