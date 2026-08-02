import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ImagePlus,
  Info,
  Loader2,
  MapPin,
  NotebookText,
  Save,
  Ticket,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCreateEvent } from "@/lib/hooks";
import { toastApiError } from "@/lib/toast";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionHeading } from "@/components/colleges/SectionHeading";
import { TextField } from "@/components/forms/TextField";
import { TextareaField } from "@/components/forms/TextareaField";
import { SelectField } from "@/components/forms/SelectField";
import { SwitchField } from "@/components/forms/SwitchField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/utils/cn";

interface CollegeCreateEventFormValues {
  eventName: string;
  category: string;
  description: string;
  rules: string;
  eligibility: string;
  venue: string;
  date: string;
  registrationStart: string;
  registrationEnd: string;
  maxParticipants: string;
  registrationFee: string;
  qrEntry: boolean;
  certificateEnabled: boolean;
  sponsors: string;
}

const DEFAULT_VALUES: CollegeCreateEventFormValues = {
  eventName: "",
  category: "",
  description: "",
  rules: "",
  eligibility: "",
  venue: "",
  date: "",
  registrationStart: "",
  registrationEnd: "",
  maxParticipants: "",
  registrationFee: "",
  qrEntry: true,
  certificateEnabled: true,
  sponsors: "",
};

const categoryOptions = [
  "Technical",
  "Cultural",
  "Workshop",
  "Sports",
  "Music",
  "Entrepreneurship",
  "Literary",
].map((category) => ({ value: category, label: category }));

const GALLERY_PRESETS = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-fuchsia-500 to-purple-500",
  "from-rose-500 to-red-500",
];

function buildEventPayload(
  values: CollegeCreateEventFormValues,
  collegeId: number | null,
  status: "draft" | "published",
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    title: values.eventName,
    college_id: collegeId ?? undefined,
    description: values.description || undefined,
    venue: values.venue || undefined,
    starts_at: values.date || undefined,
    ends_at: values.date || undefined,
    capacity: values.maxParticipants
      ? Number(values.maxParticipants)
      : undefined,
    registration_open_at: values.registrationStart || undefined,
    registration_closes_at: values.registrationEnd || undefined,
    status,
  };
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );
}

function NotSavedNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

export default function CollegeCreateEventPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedGallery, setSelectedGallery] = useState<string[]>([
    GALLERY_PRESETS[0],
  ]);
  const [savedOpen, setSavedOpen] = useState<"draft" | "published" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createEvent = useCreateEvent();

  const form = useForm<CollegeCreateEventFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });

  const toggleGallery = (preset: string) => {
    setSelectedGallery((current) =>
      current.includes(preset)
        ? current.filter((item) => item !== preset)
        : [...current, preset],
    );
  };

  const handlePublish = async () => {
    const values = form.getValues();
    const requiredFields: Array<keyof CollegeCreateEventFormValues> = [
      "eventName",
      "category",
      "venue",
      "date",
      "registrationStart",
      "registrationEnd",
    ];
    let valid = true;
    form.clearErrors();
    for (const field of requiredFields) {
      if (!String(values[field]).trim()) {
        form.setError(field, {
          type: "manual",
          message: "This field is required",
        });
        valid = false;
      }
    }
    if (!valid) return;
    setIsSubmitting(true);
    try {
      await createEvent.mutateAsync(
        buildEventPayload(values, user?.college_id ?? null, "published"),
      );
      setIsSubmitting(false);
      setSavedOpen("published");
    } catch (error) {
      setIsSubmitting(false);
      toastApiError(error, "Unable to publish event.");
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      await createEvent.mutateAsync(
        buildEventPayload(form.getValues(), user?.college_id ?? null, "draft"),
      );
      setIsSubmitting(false);
      setSavedOpen("draft");
    } catch (error) {
      setIsSubmitting(false);
      toastApiError(error, "Unable to save draft.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Event"
        subtitle="Set up a new event for your college"
        actions={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate("/admin/college/events")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        }
      />

      <form
        onSubmit={(event) => event.preventDefault()}
        className="space-y-6"
        noValidate
      >
        <section className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
          <SectionHeading
            icon={NotebookText}
            title="Event Details"
            description="Tell us what the event is about"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              name="eventName"
              control={form.control}
              label="Event name"
              placeholder="e.g. TechNova Hackathon 2026"
              className="sm:col-span-2"
            />
            <SelectField
              name="category"
              control={form.control}
              label="Event category"
              placeholder="Select a category"
              options={categoryOptions}
            />
            <TextField
              name="venue"
              control={form.control}
              label="Venue"
              placeholder="e.g. Main Auditorium"
            />
          </div>
          <TextareaField
            name="description"
            control={form.control}
            label="Description"
            placeholder="Briefly describe the event…"
            maxLength={500}
            optional
          />
          <NotSavedNote>
            Category is not saved to the backend yet.
          </NotSavedNote>
        </section>

        <section className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
          <SectionHeading
            icon={MapPin}
            title="Guidelines"
            description="Rules, eligibility and venue details"
          />
          <TextareaField
            name="rules"
            control={form.control}
            label="Rules"
            placeholder={"One rule per line\ne.g. Teams of 2–4 members"}
            optional
            rows={4}
          />
          <TextField
            name="eligibility"
            control={form.control}
            label="Eligibility"
            placeholder="e.g. All undergraduate students with a valid college ID"
            optional
          />
          <NotSavedNote>
            Rules and eligibility are not saved to the backend yet.
          </NotSavedNote>
        </section>

        <section className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
          <SectionHeading
            icon={CalendarClock}
            title="Schedule & Registration"
            description="When the event runs and how students sign up"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              name="date"
              control={form.control}
              label="Date & time"
              type="datetime-local"
              className="sm:col-span-2"
            />
            <TextField
              name="registrationStart"
              control={form.control}
              label="Registration start"
              type="datetime-local"
            />
            <TextField
              name="registrationEnd"
              control={form.control}
              label="Registration end"
              type="datetime-local"
            />
            <TextField
              name="maxParticipants"
              control={form.control}
              label="Maximum participants"
              type="number"
              placeholder="e.g. 1000"
              optional
            />
            <TextField
              name="registrationFee"
              control={form.control}
              label="Registration fee (₹)"
              type="number"
              placeholder="0 for free"
              optional
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SwitchField
              name="qrEntry"
              control={form.control}
              label="QR entry enabled"
              description="Volunteers scan QR tickets at the gate"
            />
            <SwitchField
              name="certificateEnabled"
              control={form.control}
              label="Certificates enabled"
              description="Eligible participants receive digital certificates"
            />
          </div>
          <NotSavedNote>
            Registration fee, QR entry and certificates are not saved to the
            backend yet — the schedule and registration window are.
          </NotSavedNote>
        </section>

        <section className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
          <SectionHeading
            icon={BadgeCheck}
            title="Sponsors & Gallery"
            description="Optional extras to promote the event"
          />
          <TextField
            name="sponsors"
            control={form.control}
            label="Sponsors"
            placeholder="Comma separated, e.g. TechNova Labs, CloudBase"
            optional
          />
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <ImagePlus className="h-4 w-4 text-muted-foreground" />
              Gallery
              <span className="text-xs font-normal text-muted-foreground">
                · select placeholder images
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {GALLERY_PRESETS.map((preset) => {
                const selected = selectedGallery.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => toggleGallery(preset)}
                    aria-pressed={selected}
                    className={cn(
                      "relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br transition-transform hover:scale-[1.02]",
                      preset,
                      selected && "ring-2 ring-primary ring-offset-2 ring-offset-card",
                    )}
                  >
                    {selected && (
                      <CheckCircle2 className="h-6 w-6 text-white drop-shadow" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <NotSavedNote>
            Sponsors and gallery are not saved to the backend yet.
          </NotSavedNote>
        </section>

        <div className="flex flex-col-reverse items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-card sm:flex-row">
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Ticket className="h-3.5 w-3.5" />
            Only college admins can create events
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={isSubmitting}
              onClick={handleSaveDraft}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Draft
            </Button>
            <Button
              type="button"
              className="gap-2"
              disabled={isSubmitting}
              onClick={handlePublish}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Publish
            </Button>
          </div>
        </div>
      </form>

      <Dialog
        open={savedOpen === "draft"}
        onOpenChange={(open) => {
          if (!open) setSavedOpen(null);
        }}
      >
        <DialogContent className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Save className="h-8 w-8" />
          </div>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-lg">Draft saved</DialogTitle>
            <DialogDescription>
              Your progress has been saved. You can come back and finish
              whenever you're ready.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setSavedOpen(null);
                navigate("/admin/college/events");
              }}
            >
              View All Events
            </Button>
            <Button onClick={() => setSavedOpen(null)}>Keep Editing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={savedOpen === "published"}
        onOpenChange={(open) => {
          if (!open) setSavedOpen(null);
        }}
      >
        <DialogContent className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-lg">
              Event published successfully
            </DialogTitle>
            <DialogDescription>
              <span className="block font-medium text-foreground">
                {form.getValues("eventName") || "Your event"}
              </span>
              <span className="mt-1.5 block">
                is now live and open for registrations.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              onClick={() => {
                setSavedOpen(null);
                navigate("/admin/college/my-events");
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
