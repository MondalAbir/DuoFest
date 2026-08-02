import { useState } from "react";
import {
  Bell,
  CreditCard,
  Lock,
  Loader2,
  Monitor,
  Save,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useChangePassword } from "@/lib/hooks";
import { toastApiError, toastError, toastSuccess } from "@/lib/toast";
import { getAvatarColor } from "@/utils/constants";
import type { UserRole } from "@/lib/api/types";

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Administrator",
  college_admin: "College Administrator",
  event_manager: "Event Manager",
  volunteer: "Volunteer",
  student: "Student",
};

function ProfileTab() {
  const { user, roles } = useAuth();
  const name = user?.name ?? "Guest";
  const email = user?.email ?? "";
  const role = (roles[0] as UserRole | undefined) ?? "student";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <UserAvatar name={name} color={getAvatarColor(user?.id ?? 0)} size="lg" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Profile photo</h3>
          <p className="text-xs text-muted-foreground">
            JPG, PNG or SVG. Max 2MB.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Upload
            </Button>
            <Button variant="ghost" size="sm" disabled>
              Remove
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="settings-name">Full name</Label>
          <Input id="settings-name" defaultValue={name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-role">Role</Label>
          <Input id="settings-role" value={ROLE_LABELS[role] ?? role} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-email">Email address</Label>
          <Input id="settings-email" type="email" defaultValue={email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-timezone">Timezone</Label>
          <Select defaultValue="IST">
            <SelectTrigger id="settings-timezone" aria-label="Timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IST">India Standard Time (GMT+5:30)</SelectItem>
              <SelectItem value="UTC">Coordinated Universal Time</SelectItem>
              <SelectItem value="PST">Pacific Standard Time</SelectItem>
              <SelectItem value="EST">Eastern Standard Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Save changes
        </Button>
        <p className="text-xs text-muted-foreground">
          Profile details are managed by your administrator.
        </p>
      </div>
    </div>
  );
}

const NOTIFICATION_GROUPS = [
  {
    title: "Payments",
    description: "Receive alerts for payouts, failed charges and refunds.",
    settings: [
      { key: "payment-success", label: "Payment received", defaultOn: true },
      { key: "payment-failed", label: "Payment failed", defaultOn: true },
      { key: "refund", label: "Refund processed", defaultOn: false },
    ],
  },
  {
    title: "Platform",
    description: "Stay on top of colleges, events and user activity.",
    settings: [
      { key: "college-signup", label: "New college signups", defaultOn: true },
      { key: "event-live", label: "Events going live", defaultOn: true },
      { key: "volunteer", label: "Volunteer onboarding", defaultOn: false },
    ],
  },
  {
    title: "System",
    description: "Maintenance windows and security advisories.",
    settings: [
      { key: "maintenance", label: "Scheduled maintenance", defaultOn: true },
      { key: "security", label: "Security alerts", defaultOn: true },
      { key: "newsletter", label: "Product updates", defaultOn: false },
    ],
  },
];

function NotificationsTab() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      NOTIFICATION_GROUPS.flatMap((group) =>
        group.settings.map((setting) => [setting.key, setting.defaultOn]),
      ),
    ),
  );

  const toggle = (key: string) => {
    setPrefs((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="space-y-8">
      {NOTIFICATION_GROUPS.map((group) => (
        <div key={group.title}>
          <h3 className="text-sm font-semibold text-foreground">
            {group.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {group.description}
          </p>
          <div className="mt-4 space-y-3">
            {group.settings.map((setting) => (
              <div
                key={setting.key}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {setting.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Email and in-app notification
                  </p>
                </div>
                <Switch
                  checked={prefs[setting.key]}
                  onCheckedChange={() => toggle(setting.key)}
                  aria-label={`Toggle ${setting.label}`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button className="gap-2">
        <Save className="h-4 w-4" />
        Save preferences
      </Button>
    </div>
  );
}

function AppearanceTab() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="settings-theme">Interface theme</Label>
        <Select defaultValue="system">
          <SelectTrigger id="settings-theme" className="w-full sm:w-64" aria-label="Interface theme">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">Match system</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose how DuoFest looks to you. The dashboard uses your choice even
          if your device changes.
        </p>
      </div>
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="settings-density">Density</Label>
        <Select defaultValue="comfortable">
          <SelectTrigger id="settings-density" className="w-full sm:w-64" aria-label="Density">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="comfortable">Comfortable</SelectItem>
            <SelectItem value="compact">Compact</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator />
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            Reduce motion
          </p>
          <p className="text-xs text-muted-foreground">
            Minimize page and card animations across the dashboard.
          </p>
        </div>
        <Switch aria-label="Reduce motion" />
      </div>
    </div>
  );
}

function SecurityTab() {
  const changePassword = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleChangePassword = async () => {
    if (!current || !next) {
      toastError("Enter your current and new password.");
      return;
    }
    if (next.length < 8) {
      toastError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      toastError("New password and confirmation do not match.");
      return;
    }
    try {
      await changePassword.mutateAsync({
        current_password: current,
        password: next,
        password_confirmation: confirm,
      });
      toastSuccess("Password changed successfully.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (error) {
      toastApiError(error, "Unable to change password.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Change password</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password-current">Current password</Label>
            <Input
              id="password-current"
              type="password"
              placeholder="••••••••"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password-new">New password</Label>
            <Input
              id="password-new"
              type="password"
              placeholder="••••••••"
              value={next}
              onChange={(event) => setNext(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-confirm">Confirm new password</Label>
            <Input
              id="password-confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
          </div>
        </div>
        <Button
          className="gap-2"
          onClick={handleChangePassword}
          disabled={changePassword.isPending}
        >
          {changePassword.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
          Update password
        </Button>
      </div>
      <Separator />
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Two-factor authentication
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Add an extra layer of security to your account.
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              Authenticator app
            </p>
            <p className="text-xs text-muted-foreground">
              Currently enabled since Mar 2025
            </p>
          </div>
          <Switch defaultChecked aria-label="Two-factor authentication" />
        </div>
      </div>
      <Separator />
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Active sessions</h3>
        {[
          { device: "MacBook Pro · Safari", location: "Bengaluru, IN", active: true },
          { device: "iPhone 16 · DuoFest App", location: "Bengaluru, IN", active: true },
          { device: "Windows · Chrome", location: "Mumbai, IN", active: false },
        ].map((session) => (
          <div
            key={session.device}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {session.device}
              </p>
              <p className="text-xs text-muted-foreground">{session.location}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={
                  session.active
                    ? "flex items-center gap-1.5 text-xs font-medium text-success"
                    : "text-xs text-muted-foreground"
                }
              >
                <span
                  className={
                    session.active ? "h-1.5 w-1.5 rounded-full bg-success" : "h-1.5 w-1.5 rounded-full bg-muted-foreground/40"
                  }
                />
                {session.active ? "Active" : "Revoked"}
              </span>
              {session.active && (
                <Button variant="ghost" size="sm" className="text-xs text-danger hover:bg-danger/10 hover:text-danger">
                  Revoke
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Current plan
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-foreground">
              Enterprise
            </p>
            <p className="text-sm text-muted-foreground">
              $1,200 / month · billed annually
            </p>
          </div>
          <Button variant="outline" size="sm">
            Manage plan
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Payment method</h3>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-12 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
              VISA
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Visa ending in 4242
              </p>
              <p className="text-xs text-muted-foreground">Expires 09/2028</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            Replace
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Invoices & receipts
        </h3>
        {[
          { period: "July 2026", amount: "$1,200", status: "Paid" },
          { period: "June 2026", amount: "$1,200", status: "Paid" },
          { period: "May 2026", amount: "$1,200", status: "Paid" },
        ].map((invoice) => (
          <div
            key={invoice.period}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                {invoice.period}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {invoice.amount}
              </span>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                {invoice.status}
              </span>
              <Button variant="ghost" size="sm" className="text-xs">
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account, preferences and billing"
      />

      <Tabs defaultValue="profile">
        <TabsList className="scrollbar-thin w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="profile">
            <UserRound />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Monitor />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock />
            Security
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard />
            Billing
          </TabsTrigger>
        </TabsList>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceTab />
          </TabsContent>
          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
          <TabsContent value="billing">
            <BillingTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
