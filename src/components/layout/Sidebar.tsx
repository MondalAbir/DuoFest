import { useMemo } from "react";
import { NavLink, useNavigate } from "react-router";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_SECTIONS } from "@/config/navigation";
import { Logo } from "@/components/common/Logo";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate();

  const sections = useMemo(() => NAV_SECTIONS, []);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-in-out lg:flex",
        collapsed ? "w-[76px]" : "w-[256px]",
      )}
      aria-label="Primary sidebar"
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-sidebar-border px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <Logo collapsed={collapsed} />
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        {sections.map((section) => (
          <div key={section.label} className="mb-5 last:mb-0">
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <NavLink
                          to={item.path}
                          end={item.path === "/"}
                          className={({ isActive }) =>
                            cn(
                              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                              "text-sidebar-muted hover:bg-sidebar-active-bg hover:text-sidebar-active",
                              isActive &&
                                "bg-sidebar-active-bg text-sidebar-active",
                              collapsed && "justify-center px-0",
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && (
                                <motion.span
                                  layoutId="sidebar-active-pill"
                                  className="absolute inset-0 rounded-xl bg-sidebar-active-bg"
                                  transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 32,
                                  }}
                                />
                              )}
                              <Icon
                                className={cn(
                                  "relative z-10 h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
                                )}
                              />
                              <AnimatePresence initial={false}>
                                {!collapsed && (
                                  <motion.span
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -6 }}
                                    transition={{ duration: 0.15 }}
                                    className="relative z-10 truncate"
                                  >
                                    {item.label}
                                  </motion.span>
                                )}
                              </AnimatePresence>
                              {isActive && (
                                <motion.span
                                  layoutId="sidebar-active-dot"
                                  className="absolute right-2 top-1/2 hidden h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-sidebar-active lg:block"
                                />
                              )}
                            </>
                          )}
                        </NavLink>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right">{item.label}</TooltipContent>
                      )}
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors duration-200 hover:bg-danger/10",
                collapsed && "justify-center px-0",
              )}
            >
              <LogOut className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
        </Tooltip>
        <Separator className="my-3" />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onToggleCollapse}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors duration-200 hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-[18px] w-[18px] shrink-0" />
              ) : (
                <PanelLeftClose className="h-[18px] w-[18px] shrink-0" />
              )}
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    Collapse
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
}
