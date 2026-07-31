import { useState } from "react";
import { useForm } from "react-hook-form";
import { Building2, KeyRound, Megaphone, Save, TicketCheck } from "lucide-react";
import { TextField } from "@/components/forms/TextField";
import { SwitchField } from "@/components/forms/SwitchField";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";

const TABS = [
  { key: "general", label: "General", icon: Building2 },
  { key: "registration", label: "Registration", icon: TicketCheck },
  { key: "notifications", label: "Notifications", icon: Megaphone },
  { key: "security", label: "Security", icon: KeyRound },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface GeneralForm {
  collegeName: string;
  shortName: string;
  established: string;
  email: string;
  phone: string;
  address: string;
  description: string;
}

interface RegistrationForm {
  autoApprove: boolean;
  limitPerStudent: boolean;
  openBeforeDays: string;
  maxPerEvent: string;
  allowWalkins: boolean;
}

interface NotificationForm {
  emailDigest: boolean;
  smsAlerts: boolean;
  eventReminders: boolean;
  volunteerAlerts: boolean;
  weeklyReport: boolean;
}

interface SecurityForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactor: boolean;
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="mb-5">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function SaveBar({ onSave }: { onSave: () => void }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (saving) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
      onSave();
    }, 900);
  };

  return (
    <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 px-5 py-4 shadow-card backdrop-blur">
      <p className="text-sm text-muted-foreground">
        {saved ? (
          <span className="font-medium text-success">Settings saved successfully.</span>
        ) : (
          "Changes are saved to this device only."
        )}
      </p>
      <Button className="gap-2" onClick={handleSave} disabled={saving}>
        {saving ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}

export default function CollegeSettingsPage() {
  const [tab, setTab] = useState<TabKey>("general");

  const generalForm = useForm<GeneralForm>({
    defaultValues: {
      collegeName: "Brainware University",
      shortName: "BWU",
      established: "2015",
      email: "admin@brainware.edu",
      phone: "+91 33 4000 1234",
      address: "Barrackpore, West Bengal",
      description:
        "Multidisciplinary university hosting flagship cultural, technical and sports events.",
    },
  });

  const registrationForm = useForm<RegistrationForm>({
    defaultValues: {
      autoApprove: true,
      limitPerStudent: true,
      openBeforeDays: "30",
      maxPerEvent: "2000",
      allowWalkins: false,
    },
  });

  const notificationForm = useForm<NotificationForm>({
    defaultValues: {
      emailDigest: true,
      smsAlerts: false,
      eventReminders: true,
      volunteerAlerts: true,
      weeklyReport: false,
    },
  });

  const securityForm = useForm<SecurityForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      twoFactor: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="College Settings"
        subtitle="Manage portal configuration"
      />

      <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-muted p-1">
        {TABS.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab === item.key
                ? "bg-card text-foreground shadow-card"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <form className="space-y-6" onSubmit={generalForm.handleSubmit(() => {})}>
          <SectionCard
            title="College Information"
            description="Basic details shown across the portal"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                name="collegeName"
                control={generalForm.control}
                label="College name"
              />
              <TextField
                name="shortName"
                control={generalForm.control}
                label="Short name"
                optional
              />
              <TextField
                name="established"
                control={generalForm.control}
                label="Established year"
              />
              <TextField
                name="email"
                control={generalForm.control}
                label="Admin email"
                type="email"
              />
              <TextField
                name="phone"
                control={generalForm.control}
                label="Phone"
              />
              <TextField
                name="address"
                control={generalForm.control}
                label="Address"
              />
            </div>
            <div className="mt-4 grid gap-2">
              <label className="text-sm font-medium" htmlFor="description">
                Description
              </label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Short description"
                className="rounded-xl"
                {...generalForm.register("description")}
              />
            </div>
          </SectionCard>
          <SaveBar onSave={() => generalForm.handleSubmit(() => {})()} />
        </form>
      )}

      {tab === "registration" && (
        <form
          className="space-y-6"
          onSubmit={registrationForm.handleSubmit(() => {})}
        >
          <SectionCard
            title="Registration Defaults"
            description="Applied to newly created events"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="openBeforeDays">
                  Open registrations before event
                </label>
                <Input
                  id="openBeforeDays"
                  type="number"
                  className="rounded-xl"
                  {...registrationForm.register("openBeforeDays")}
                />
                <p className="text-xs text-muted-foreground">In days</p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="maxPerEvent">
                  Max registrations per event
                </label>
                <Input
                  id="maxPerEvent"
                  type="number"
                  className="rounded-xl"
                  {...registrationForm.register("maxPerEvent")}
                />
              </div>
            </div>
          </SectionCard>
          <SectionCard
            title="Approval & Limits"
            description="Control how registrations are handled"
          >
            <div className="space-y-3">
              <SwitchField
                name="autoApprove"
                control={registrationForm.control}
                label="Auto-approve registrations"
                description="Approve instantly instead of manual review"
              />
              <SwitchField
                name="limitPerStudent"
                control={registrationForm.control}
                label="Limit registrations per student"
                description="Cap how many events a student can join"
              />
              <SwitchField
                name="allowWalkins"
                control={registrationForm.control}
                label="Allow walk-in registrations"
                description="Permit on-the-spot signups at the gate"
              />
            </div>
          </SectionCard>
          <SaveBar onSave={() => registrationForm.handleSubmit(() => {})()} />
        </form>
      )}

      {tab === "notifications" && (
        <form
          className="space-y-6"
          onSubmit={notificationForm.handleSubmit(() => {})}
        >
          <SectionCard
            title="Communication Preferences"
            description="Which notifications are sent to admins and students"
          >
            <div className="space-y-3">
              <SwitchField
                name="emailDigest"
                control={notificationForm.control}
                label="Daily email digest"
                description="Summary of registrations and check-ins"
              />
              <SwitchField
                name="smsAlerts"
                control={notificationForm.control}
                label="SMS alerts"
                description="SMS for critical incidents"
              />
              <SwitchField
                name="eventReminders"
                control={notificationForm.control}
                label="Event reminders"
                description="Auto reminders to registered students"
              />
              <SwitchField
                name="volunteerAlerts"
                control={notificationForm.control}
                label="Volunteer shift alerts"
                description="Notify volunteers about upcoming shifts"
              />
              <SwitchField
                name="weeklyReport"
                control={notificationForm.control}
                label="Weekly performance report"
                description="Email with portal analytics every Monday"
              />
            </div>
          </SectionCard>
          <SaveBar onSave={() => notificationForm.handleSubmit(() => {})()} />
        </form>
      )}

      {tab === "security" && (
        <form
          className="space-y-6"
          onSubmit={securityForm.handleSubmit(() => {})}
        >
          <SectionCard
            title="Change Password"
            description="Update your portal administrator password"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextField
                name="currentPassword"
                control={securityForm.control}
                label="Current password"
                type="password"
              />
              <TextField
                name="newPassword"
                control={securityForm.control}
                label="New password"
                type="password"
              />
              <TextField
                name="confirmPassword"
                control={securityForm.control}
                label="Confirm new password"
                type="password"
              />
            </div>
          </SectionCard>
          <SectionCard
            title="Account Protection"
            description="Extra security layers for the admin account"
          >
            <div className="space-y-3">
              <SwitchField
                name="twoFactor"
                control={securityForm.control}
                label="Two-factor authentication"
                description="Require an OTP on login from new devices"
              />
            </div>
          </SectionCard>
          <SaveBar onSave={() => securityForm.handleSubmit(() => {})()} />
        </form>
      )}
    </div>
  );
}
