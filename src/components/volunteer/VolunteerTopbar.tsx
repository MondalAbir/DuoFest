import { useLocation } from "react-router";
import { CircleDot, DoorOpen } from "lucide-react";
import { volunteerRouteTitles } from "@/config/volunteerNavigation";
import { VOLUNTEER_EVENT } from "@/data/volunteer/dashboard";
import { volunteerProfile } from "@/data/volunteer/profile";
import { Logo } from "@/components/common/Logo";
import { UserAvatar } from "@/components/common/UserAvatar";

export function VolunteerTopbar() {
  const location = useLocation();
  const title =
    volunteerRouteTitles[location.pathname] ?? "Volunteer Portal";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="lg:hidden">
            <Logo subtitle="Volunteer" collapsed />
          </div>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-base font-semibold tracking-tight text-foreground">
              {title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {VOLUNTEER_EVENT.date} · {VOLUNTEER_EVENT.time}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground shadow-sm">
            <DoorOpen className="h-3.5 w-3.5 text-primary" />
            {VOLUNTEER_EVENT.gate}
          </span>
          <span className="hidden h-8 items-center gap-1.5 rounded-full bg-success/10 px-3 text-xs font-semibold text-success sm:inline-flex">
            <CircleDot className="h-3.5 w-3.5" />
            Live
          </span>
          <div className="ml-1 lg:hidden">
            <UserAvatar
              name={volunteerProfile.name}
              color={volunteerProfile.avatarColor}
              size="sm"
              className="h-8 w-8 text-xs"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
