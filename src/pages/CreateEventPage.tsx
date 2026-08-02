import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Controller,
  useFieldArray,
  useForm,
  type FieldPath,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Eye,
  FileBadge,
  HandCoins,
  Image as ImageIcon,
  Info,
  Loader2,
  MapPin,
  NotebookText,
  Plus,
  Save,
  Ticket,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  CERTIFICATE_TEMPLATES,
  SHIFT_SLOTS,
  STEP_FIELDS,
  TIMEZONES,
  VOLUNTEER_DAY_OPTIONS,
  createEventDefaultValues,
  createEventSchema,
  type CreateEventFormValues,
} from "@/pages/events/createEventSchema";
import { useColleges, useEventCategories, useCreateEvent, usePublishEvent } from "@/lib/hooks";
import { toastApiError } from "@/lib/toast";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionHeading } from "@/components/colleges/SectionHeading";
import { EventStepper, EVENT_STEPS } from "@/components/events/EventStepper";
import { BannerUploader } from "@/components/events/BannerUploader";
import { SearchableSelectField } from "@/components/forms/SearchableSelectField";
import { SelectField } from "@/components/forms/SelectField";
import { SwitchField } from "@/components/forms/SwitchField";
import { TextareaField } from "@/components/forms/TextareaField";
import { TextField } from "@/components/forms/TextField";
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

const timezoneOptions = TIMEZONES.map((timezone) => ({
  value: timezone,
  label: timezone,
}));

const templateOptions = CERTIFICATE_TEMPLATES.map((template) => ({
  value: template,
  label: template,
}));

const dayOptions = VOLUNTEER_DAY_OPTIONS.map((day) => ({
  value: day,
  label: day,
}));

const slotOptions = SHIFT_SLOTS.map((slot) => ({
  value: slot,
  label: slot,
}));

function buildEventPayload(
  values: CreateEventFormValues,
  collegeIdByName: Map<string, string>,
  status: "draft" | "published",
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    title: values.eventName,
    college_id: collegeIdByName.get(values.hostCollege) ?? null,
    description: values.description || undefined,
    venue: values.venueName || undefined,
    starts_at: `${values.startDate}T${values.startTime || "00:00"}`,
    ends_at: `${values.endDate}T${values.endTime || "00:00"}`,
    capacity: values.maxCapacity ? Number(values.maxCapacity) : undefined,
    registration_enabled: true,
    registration_closes_at: values.registrationDeadline || undefined,
    status,
  };
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  muted?: boolean;
}

function NotSavedNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

function SummaryRow({ label, value, muted }: SummaryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "max-w-[60%] truncate text-right font-medium text-foreground",
          muted && "text-muted-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function SummaryBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const [publishedOpen, setPublishedOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: collegesData } = useColleges({ perPage: 100 });
  const { data: categoriesData } = useEventCategories();
  const createEvent = useCreateEvent();
  const publishEvent = usePublishEvent();

  const collegeItems = collegesData?.items ?? [];
  const collegeOptions = collegeItems.map((college) => ({
    value: college.name,
    label: college.name,
  }));
  const collegeIdByName = useMemo(
    () =>
      new Map(
        collegeItems.map((college) => [college.name, String(college.id)]),
      ),
    [collegeItems],
  );
  const categoryOptions = (categoriesData?.items ?? []).map((category) => ({
    value: category.name,
    label: category.name,
  }));

  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: createEventDefaultValues,
    mode: "onTouched",
  });

  const { errors } = form.formState;

  const shifts = useFieldArray({
    control: form.control,
    name: "volunteerShifts",
  });
  const sponsors = useFieldArray({
    control: form.control,
    name: "sponsors",
  });

  const errorSteps = STEP_FIELDS.flatMap((fields, index) =>
    fields.some((field) => form.formState.errors[field]) ? [index] : [],
  );

  const triggerStep = async (index: number) => {
    const fields = STEP_FIELDS[index] as FieldPath<CreateEventFormValues>[];
    const valid = await form.trigger(fields);
    if (valid) setStep((current) => Math.min(current + 1, EVENT_STEPS.length - 1));
  };

  const goBack = () => setStep((current) => Math.max(current - 1, 0));

  const handlePublish = async () => {
    const result = createEventSchema.safeParse(form.getValues());
    if (!result.success) {
      form.clearErrors();
      for (const issue of result.error.issues) {
        const path = issue.path.join(".") as FieldPath<CreateEventFormValues>;
        form.setError(path, { type: "manual", message: issue.message });
      }
      const invalidPaths = new Set(
        result.error.issues.map((issue) => issue.path[0]),
      );
      const firstInvalid = STEP_FIELDS.findIndex((fields) =>
        fields.some((field) => invalidPaths.has(field)),
      );
      if (firstInvalid >= 0) setStep(firstInvalid);
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createEvent.mutateAsync(
        buildEventPayload(values, collegeIdByName, "draft"),
      );
      await publishEvent.mutateAsync(created.id);
      setIsSubmitting(false);
      setPublishedOpen(true);
    } catch (error) {
      setIsSubmitting(false);
      toastApiError(error, "Unable to publish event.");
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      await createEvent.mutateAsync(
        buildEventPayload(values, collegeIdByName, "draft"),
      );
      setIsSubmitting(false);
      setDraftOpen(true);
    } catch (error) {
      setIsSubmitting(false);
      toastApiError(error, "Unable to save draft.");
    }
  };

  const values = form.getValues();
  const isReview = step === EVENT_STEPS.length - 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Event"
        subtitle="Set up a new fest event in a few quick steps"
        actions={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate("/admin/events")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        }
      />

      <EventStepper
        current={step}
        onSelect={setStep}
        errorSteps={errorSteps}
      />

      <form
        onSubmit={(event) => event.preventDefault()}
        className="space-y-6 rounded-xl border border-border bg-card p-5 sm:p-6"
        noValidate
      >
        {step === 0 && (
          <div className="space-y-6">
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
                placeholder="e.g. TechNova Hackathon"
                className="sm:col-span-2"
              />
              <SelectField
                name="category"
                control={form.control}
                label="Category"
                placeholder="Select a category"
                options={categoryOptions}
              />
              <SearchableSelectField
                name="hostCollege"
                control={form.control}
                label="Host college"
                placeholder="Search colleges…"
                options={collegeOptions}
              />
              <TextField
                name="organizer"
                control={form.control}
                label="Organizer"
                placeholder="e.g. Dr. Arjun Mehta"
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
              Category and organizer are not saved to the backend yet.
            </NotSavedNote>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <SectionHeading
              icon={ImageIcon}
              title="Event Banner"
              description="A wide banner makes your event stand out on the list"
            />
            <Controller
              name="banner"
              control={form.control}
              render={({ field, fieldState }) => (
                <BannerUploader
                  id="event-banner"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
            <NotSavedNote>
              Banner upload is not saved to the backend yet.
            </NotSavedNote>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <SectionHeading
              icon={MapPin}
              title="Venue"
              description="Where will the event take place?"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                name="venueName"
                control={form.control}
                label="Venue name"
                placeholder="e.g. Main Auditorium"
                className="sm:col-span-2"
              />
              <TextareaField
                name="address"
                control={form.control}
                label="Address"
                placeholder="Street, area…"
                className="sm:col-span-2"
              />
              <TextField
                name="city"
                control={form.control}
                label="City"
                placeholder="e.g. Mumbai"
              />
              <TextField
                name="state"
                control={form.control}
                label="State"
                placeholder="e.g. Maharashtra"
              />
              <TextField
                name="mapLink"
                control={form.control}
                label="Map link"
                placeholder="https://maps.google.com/…"
                optional
                className="sm:col-span-2"
              />
            </div>
            <NotSavedNote>
              Address, city, state and map link are not saved to the backend
              yet — only the venue name is.
            </NotSavedNote>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <SectionHeading
              icon={CalendarClock}
              title="Schedule"
              description="When does the event start and end?"
            />
            <div className="grid grid-cols-2 gap-4">
              <TextField
                name="startDate"
                control={form.control}
                label="Start date"
                type="date"
              />
              <TextField
                name="startTime"
                control={form.control}
                label="Start time"
                type="time"
              />
              <TextField
                name="endDate"
                control={form.control}
                label="End date"
                type="date"
              />
              <TextField
                name="endTime"
                control={form.control}
                label="End time"
                type="time"
              />
              <SelectField
                name="timezone"
                control={form.control}
                label="Timezone"
                options={timezoneOptions}
                className="col-span-2"
              />
            </div>
            <NotSavedNote>
              Timezone is not saved to the backend yet.
            </NotSavedNote>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <SectionHeading
              icon={Ticket}
              title="Registration"
              description="Configure how attendees sign up"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                name="registrationDeadline"
                control={form.control}
                label="Registration deadline"
                type="date"
              />
              <TextField
                name="registrationFee"
                control={form.control}
                label="Registration fee (₹)"
                placeholder="e.g. 500"
                optional
              />
              <TextField
                name="maxCapacity"
                control={form.control}
                label="Maximum capacity"
                placeholder="e.g. 1000"
                optional
                className="sm:col-span-2"
              />
            </div>
            <SwitchField
              name="paymentRequired"
              control={form.control}
              label="Require online payment"
              description="Attendees must pay online before registration is confirmed"
            />
            <NotSavedNote>
              Registration fee and the online payment toggle are not saved to
              the backend yet — the deadline and capacity are.
            </NotSavedNote>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <SectionHeading
              icon={Users}
              title="Volunteers"
              description="How many volunteers do you need, and across which slots?"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                name="volunteersNeeded"
                control={form.control}
                label="Volunteers needed"
                placeholder="e.g. 25"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Per-day breakdown
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    shifts.append({ day: "Day 1", slot: "", count: "" })
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add shift
                </Button>
              </div>

              <div className="space-y-3">
                {shifts.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-xl border border-border bg-muted/20 p-3.5"
                  >
                    <div className="grid grid-cols-2 items-end gap-3">
                      <SelectField
                        name={`volunteerShifts.${index}.day`}
                        control={form.control}
                        label={`Shift ${index + 1} — day`}
                        options={dayOptions}
                      />
                      <SelectField
                        name={`volunteerShifts.${index}.slot`}
                        control={form.control}
                        label="Time slot"
                        options={slotOptions}
                      />
                      <TextField
                        name={`volunteerShifts.${index}.count`}
                        control={form.control}
                        label="Volunteers"
                        placeholder="e.g. 5"
                      />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove shift ${index + 1}`}
                          disabled={shifts.fields.length === 1}
                          onClick={() => shifts.remove(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.volunteerShifts && (
                <p className="text-xs font-medium text-destructive">
                  {errors.volunteerShifts.message ??
                    "Please fix the shifts above"}
                </p>
              )}
            </div>
            <NotSavedNote>
              Volunteer shifts and counts are not saved to the backend yet.
            </NotSavedNote>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <SectionHeading
              icon={FileBadge}
              title="Certificates"
              description="Award participants with digital certificates"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                name="certificateTemplate"
                control={form.control}
                label="Certificate template"
                placeholder="Select a template"
                options={templateOptions}
              />
              <TextField
                name="issuerName"
                control={form.control}
                label="Issued by"
                placeholder="e.g. IIT Bombay"
              />
            </div>
            <SwitchField
              name="autoGenerateCertificates"
              control={form.control}
              label="Auto-generate certificates"
              description="Certificates are created automatically once an event is completed"
            />
            <NotSavedNote>
              Certificate template, issuer and auto-generation are not saved to
              the backend yet.
            </NotSavedNote>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6">
            <SectionHeading
              icon={HandCoins}
              title="Sponsors"
              description="Add sponsors who are backing this event"
            />
            <div className="space-y-3">
              {sponsors.fields.length === 0 && (
                <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                  No sponsors yet — add your first sponsor below.
                </p>
              )}
              {sponsors.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-xl border border-border bg-muted/20 p-3.5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      Sponsor {index + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove sponsor ${index + 1}`}
                      onClick={() => sponsors.remove(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <TextField
                      name={`sponsors.${index}.name`}
                      control={form.control}
                      label="Sponsor name"
                      placeholder="e.g. Acme Corp"
                    />
                    <TextField
                      name={`sponsors.${index}.amount`}
                      control={form.control}
                      label="Amount (₹)"
                      placeholder="e.g. 50000"
                      optional
                    />
                    <TextField
                      name={`sponsors.${index}.url`}
                      control={form.control}
                      label="Website"
                      placeholder="https://…"
                      optional
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => sponsors.append({ name: "", amount: "", url: "" })}
            >
              <Plus className="h-4 w-4" />
              Add sponsor
            </Button>
            <NotSavedNote>
              Sponsors are not saved to the backend yet.
            </NotSavedNote>
          </div>
        )}

        {isReview && (
          <div className="space-y-6">
            <SectionHeading
              icon={BadgeCheck}
              title="Review & Publish"
              description="Double-check everything before publishing"
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SummaryBlock icon={NotebookText} title="Event Details">
                <SummaryRow
                  label="Name"
                  value={values.eventName || "—"}
                  muted={!values.eventName}
                />
                <SummaryRow
                  label="Category"
                  value={values.category || "—"}
                  muted={!values.category}
                />
                <SummaryRow
                  label="Host college"
                  value={values.hostCollege || "—"}
                  muted={!values.hostCollege}
                />
                <SummaryRow
                  label="Organizer"
                  value={values.organizer || "—"}
                  muted={!values.organizer}
                />
                <SummaryRow
                  label="Description"
                  value={values.description || "Not provided"}
                  muted={!values.description}
                />
              </SummaryBlock>

              <SummaryBlock icon={MapPin} title="Venue">
                <SummaryRow
                  label="Venue"
                  value={values.venueName || "—"}
                  muted={!values.venueName}
                />
                <SummaryRow
                  label="Address"
                  value={values.address || "—"}
                  muted={!values.address}
                />
                <SummaryRow
                  label="City"
                  value={values.city || "—"}
                  muted={!values.city}
                />
                <SummaryRow
                  label="State"
                  value={values.state || "—"}
                  muted={!values.state}
                />
                <SummaryRow
                  label="Map link"
                  value={values.mapLink || "Not provided"}
                  muted={!values.mapLink}
                />
              </SummaryBlock>

              <SummaryBlock icon={CalendarClock} title="Schedule">
                <SummaryRow
                  label="Starts"
                  value={
                    values.startDate
                      ? `${values.startDate} · ${values.startTime || "—"}`
                      : "—"
                  }
                  muted={!values.startDate}
                />
                <SummaryRow
                  label="Ends"
                  value={
                    values.endDate
                      ? `${values.endDate} · ${values.endTime || "—"}`
                      : "—"
                  }
                  muted={!values.endDate}
                />
                <SummaryRow
                  label="Timezone"
                  value={values.timezone || "—"}
                  muted={!values.timezone}
                />
              </SummaryBlock>

              <SummaryBlock icon={Ticket} title="Registration">
                <SummaryRow
                  label="Deadline"
                  value={values.registrationDeadline || "—"}
                  muted={!values.registrationDeadline}
                />
                <SummaryRow
                  label="Fee"
                  value={
                    values.registrationFee
                      ? `₹${values.registrationFee}`
                      : "Free"
                  }
                />
                <SummaryRow
                  label="Max capacity"
                  value={values.maxCapacity || "Unlimited"}
                  muted={!values.maxCapacity}
                />
                <SummaryRow
                  label="Online payment"
                  value={values.paymentRequired ? "Required" : "Not required"}
                />
              </SummaryBlock>

              <SummaryBlock icon={Users} title="Volunteers">
                <SummaryRow
                  label="Total needed"
                  value={values.volunteersNeeded || "—"}
                  muted={!values.volunteersNeeded}
                />
                {values.volunteerShifts.length > 0 &&
                  values.volunteerShifts.map((shift, index) => (
                    <SummaryRow
                      key={index}
                      label={`Shift ${index + 1}`}
                      value={`${shift.day} · ${shift.slot || "Any slot"} · ${
                        shift.count ? `${shift.count} volunteers` : "—"
                      }`}
                    />
                  ))}
              </SummaryBlock>

              <SummaryBlock icon={FileBadge} title="Certificates">
                <SummaryRow
                  label="Template"
                  value={values.certificateTemplate || "—"}
                  muted={!values.certificateTemplate}
                />
                <SummaryRow
                  label="Issued by"
                  value={values.issuerName || "—"}
                  muted={!values.issuerName}
                />
                <SummaryRow
                  label="Auto-generate"
                  value={
                    values.autoGenerateCertificates ? "Enabled" : "Disabled"
                  }
                />
              </SummaryBlock>

              <SummaryBlock icon={HandCoins} title="Sponsors">
                {values.sponsors.length === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">
                    No sponsors added
                  </p>
                ) : (
                  values.sponsors.map((sponsor, index) => (
                    <SummaryRow
                      key={index}
                      label={`Sponsor ${index + 1}`}
                      value={sponsor.name || "—"}
                      muted={!sponsor.name}
                    />
                  ))
                )}
              </SummaryBlock>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Publishing will make this event visible to all students and
                open it for registrations.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-border pt-5 sm:flex-row">
          <div>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={step === 0}
              onClick={goBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={isSubmitting}
              onClick={handleSaveDraft}
            >
              {isSubmitting && !isReview ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Draft
            </Button>

            {!isReview ? (
              <Button type="button" className="gap-2" onClick={() => triggerStep(step)}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye className="h-4 w-4" />
                  Preview
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
                  Publish Event
                </Button>
              </>
            )}
          </div>
        </div>
      </form>

      <PreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        values={values}
      />

      <Dialog
        open={draftOpen}
        onOpenChange={(next) => {
          if (!next) setDraftOpen(false);
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
                setDraftOpen(false);
                navigate("/admin/events");
              }}
            >
              View All Events
            </Button>
            <Button
              onClick={() => {
                setDraftOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Keep Editing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={publishedOpen}
        onOpenChange={(next) => {
          if (!next) setPublishedOpen(false);
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
                {values.eventName || "Your event"}
              </span>
              <span className="mt-1.5 block">
                is now live and open for registrations.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              onClick={() => {
                setPublishedOpen(false);
                navigate("/admin/events");
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

function PreviewDialog({
  open,
  onOpenChange,
  values,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: CreateEventFormValues;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl gap-0 overflow-hidden p-0">
        <div className="flex max-h-[90vh] flex-col">
          <div className="shrink-0 space-y-1.5 border-b border-border px-6 py-4">
            <DialogHeader>
              <DialogTitle>Event Preview</DialogTitle>
              <DialogDescription>
                This is how attendees will see your event.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-border">
                <div className="flex aspect-[16/6] w-full items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 text-3xl font-bold text-white">
                  {values.eventName ? values.eventName[0] : "E"}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                  {values.category || "Category"}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {values.hostCollege || "Host college"}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {values.eventName || "Untitled Event"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {values.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                  <p className="text-xs text-muted-foreground">When</p>
                  <p className="mt-1 font-medium text-foreground">
                    {values.startDate
                      ? `${values.startDate} · ${values.startTime || "—"}`
                      : "TBD"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                  <p className="text-xs text-muted-foreground">Where</p>
                  <p className="mt-1 font-medium text-foreground">
                    {values.venueName || "TBD"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                  <p className="text-xs text-muted-foreground">Registration</p>
                  <p className="mt-1 font-medium text-foreground">
                    {values.registrationFee
                      ? `₹${values.registrationFee}`
                      : "Free"}
                  </p>
                </div>
              </div>

              {values.sponsors.length > 0 && (
                <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                  <p className="text-xs text-muted-foreground">
                    Powered by
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {values.sponsors.map((sponsor, index) => (
                      <span
                        key={index}
                        className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        {sponsor.name || "Sponsor"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="shrink-0 gap-2 border-t border-border px-6 py-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Looks Good
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
