import { useState } from "react";
import { Building2, Check, ChevronDown, Menu, Search } from "lucide-react";
import { motion } from "framer-motion";
import { collegeOptions } from "@/data/college/dashboard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CollegeNotificationsMenu } from "./CollegeNotificationsMenu";
import { CollegeUserMenu } from "./CollegeUserMenu";
import { CollegeDatePicker } from "./CollegeDatePicker";
import { cn } from "@/utils/cn";

interface CollegeTopbarProps {
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  className?: string;
}

export function CollegeTopbar({
  onOpenMobileSidebar,
  onOpenSearch,
  className,
}: CollegeTopbarProps) {
  const [college, setCollege] = useState(collegeOptions[0]);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border px-4 sm:px-6",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenMobileSidebar}
        className="lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex max-w-[220px] items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-none"
            aria-label="Switch college"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </span>
            <span className="hidden min-w-0 text-left lg:block">
              <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Current College
              </span>
              <span className="block max-w-[220px] truncate text-sm font-semibold leading-tight text-foreground">
                {college}
              </span>
            </span>
            <ChevronDown className="hidden h-4 w-4 shrink-0 text-muted-foreground lg:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Switch college
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {collegeOptions.map((option) => (
            <DropdownMenuItem
              key={option}
              className="cursor-pointer"
              onClick={() => setCollege(option)}
            >
              <span className="flex-1 truncate">{option}</span>
              {option === college && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSearch}
          className="h-9 w-9 gap-2 px-0 sm:w-56 sm:justify-start sm:px-3"
          aria-label="Open search"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="hidden min-w-0 flex-1 truncate text-sm font-normal text-muted-foreground sm:block">
            Search events, registrations, volunteers…
          </span>
          <kbd className="ml-auto hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">
            ⌘K
          </kbd>
        </Button>

        <CollegeNotificationsMenu />
        <CollegeUserMenu />
        <CollegeDatePicker />
      </div>
    </motion.header>
  );
}
