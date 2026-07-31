import { NavLink } from "react-router";
import { LogOut } from "lucide-react";
import { COLLEGE_NAV_SECTIONS } from "@/config/collegeNavigation";
import { Logo } from "@/components/common/Logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/utils/cn";

interface CollegeMobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CollegeMobileSidebar({
  open,
  onOpenChange,
}: CollegeMobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[280px] gap-0 p-0"
        aria-label="College portal mobile navigation"
      >
        <SheetHeader className="flex h-16 shrink-0 flex-row items-center border-b border-border px-4">
          <SheetTitle asChild>
            <Logo subtitle="College Portal" />
          </SheetTitle>
        </SheetHeader>
        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
          {COLLEGE_NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-5 last:mb-0">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        end={item.path === "/admin/college"}
                        onClick={() => onOpenChange(false)}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )
                        }
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        {item.label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors duration-200 hover:bg-danger/10"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            Logout
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
