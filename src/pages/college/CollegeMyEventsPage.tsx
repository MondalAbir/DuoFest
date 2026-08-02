import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Eye,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import type { CollegeEvent, CollegeEventStatus } from "@/data/college/events";
import { useAuth } from "@/context/AuthContext";
import { useEvents } from "@/lib/hooks";
import { adaptCollegeEvent } from "@/lib/adapters";
import { formatCompact, formatCurrency, formatDate } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CollegeEventTab {
  value: string;
  label: string;
  statuses: CollegeEventStatus[];
}

const TABS: CollegeEventTab[] = [
  { value: "upcoming", label: "Upcoming", statuses: ["upcoming"] },
  { value: "ongoing", label: "Ongoing", statuses: ["live"] },
  { value: "completed", label: "Completed", statuses: ["completed"] },
  { value: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
];

function EventCard({
  event,
  index,
  onView,
}: {
  event: CollegeEvent;
  index: number;
  onView: (event: CollegeEvent) => void;
}) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
    >
      <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow duration-300 hover:shadow-card-hover">
        <button
          type="button"
          onClick={() => onView(event)}
          className={cn(
            "relative flex h-32 w-full items-center justify-center bg-gradient-to-br text-white",
            event.gradient,
          )}
          aria-label={`View ${event.name}`}
        >
          <span className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <span className="relative px-4 text-lg font-bold tracking-tight drop-shadow">
            {event.name}
          </span>
          <span className="absolute right-3 top-3">
            <StatusBadge status={event.status} dot />
          </span>
        </button>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(event.date)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {event.venue}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-border bg-muted/30 px-2 py-2">
              <p className="text-sm font-semibold text-foreground">
                {formatCompact(event.registrations)}
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Ticket className="h-3 w-3" /> Registrations
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 px-2 py-2">
              <p className="text-sm font-semibold text-foreground">
                {event.volunteers}
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Users className="h-3 w-3" /> Volunteers
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 px-2 py-2">
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(event.revenue)}
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Wallet className="h-3 w-3" /> Revenue
              </p>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => onView(event)}
            >
              <Eye className="h-3.5 w-3.5" />
              Details
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Quick actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate("/admin/college/events/create")}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Share link
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Download report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CollegeMyEventsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");

  const { data: eventsData, isLoading } = useEvents({
    college_id: user?.college_id ?? undefined,
    perPage: 100,
  });

  const events = useMemo(
    () => (eventsData?.items ?? []).map(adaptCollegeEvent),
    [eventsData],
  );

  const groups = useMemo(
    () =>
      TABS.map((tab) => ({
        ...tab,
        events: events.filter((event) => tab.statuses.includes(event.status)),
      })),
    [events],
  );

  const active = groups.find((group) => group.value === activeTab)!;
  const total = useMemo(
    () => events.reduce((sum, event) => sum + event.registrations, 0),
    [events],
  );

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Events"
        subtitle={`${events.length} events · ${formatCompact(total)} registrations`}
        actions={
          <Button
            className="gap-2"
            onClick={() => navigate("/admin/college/events/create")}
          >
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 sm:w-auto">
          {groups.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              {tab.label}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {tab.events.length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {groups.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            {tab.events.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
                <CalendarDays className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-medium text-foreground">
                  No {tab.label.toLowerCase()} events
                </p>
                <p className="text-sm text-muted-foreground">
                  Events in this state will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tab.events.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                    onView={(target) =>
                      navigate(`/admin/college/events/${target.id}`)
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
