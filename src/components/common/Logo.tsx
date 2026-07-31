import { cn } from "@/utils/cn";

interface LogoProps {
  collapsed?: boolean;
  subtitle?: string;
  className?: string;
}

export function Logo({
  collapsed = false,
  subtitle = "Super Admin",
  className,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-500 shadow-md shadow-primary/25">
        <svg
          viewBox="0 0 32 32"
          className="h-5 w-5"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 9h7.2a5.8 5.8 0 0 1 0 11.6H14V23h-4V9Zm4 3.6v4.4h3.2a2.2 2.2 0 0 0 0-4.4H14Z"
            fill="white"
          />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-warning" />
      </div>
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight text-foreground">
            DuoFest
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}
