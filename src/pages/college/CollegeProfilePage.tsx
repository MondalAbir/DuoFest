import { useState } from "react";
import {
  AlertTriangle,
  Laptop,
  LogOut,
  MonitorSmartphone,
  ShieldCheck,
} from "lucide-react";
import {
  collegeActiveDevices,
  collegeLoginHistory,
  type CollegeActiveDevice,
} from "@/data/college/profile";
import { formatDateTime } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function DeviceRow({
  device,
  onRevoke,
}: {
  device: CollegeActiveDevice;
  onRevoke: (id: string) => void;
}) {
  const [revoked, setRevoked] = useState(false);

  const handleRevoke = () => {
    setRevoked(true);
    setTimeout(() => onRevoke(device.id), 600);
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          {device.current ? <Laptop className="h-5 w-5" /> : <MonitorSmartphone className="h-5 w-5" />}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 truncate text-sm font-medium text-foreground">
            {device.name}
            {device.current && (
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                Current
              </span>
            )}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {device.browser} · {device.location} · {device.lastActive}
          </p>
        </div>
      </div>
      {!device.current && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1.5 text-muted-foreground hover:text-destructive"
          disabled={revoked}
          onClick={handleRevoke}
        >
          <LogOut className="h-3.5 w-3.5" />
          {revoked ? "Revoking…" : "Revoke"}
        </Button>
      )}
    </div>
  );
}

export default function CollegeProfilePage() {
  const [devices, setDevices] = useState(collegeActiveDevices);

  const lastLogin = collegeLoginHistory[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="Manage your account and security"
      />

      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center">
        <UserAvatar
          name="Rahul Banerjee"
          color="#5B5CEB"
          size="lg"
          className="h-20 w-20 text-2xl"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            Rahul Banerjee
          </h3>
          <p className="text-sm text-muted-foreground">
            College Admin · Brainware University
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            rahul.banerjee@brainware.edu · Admin since Aug 2024
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-3 gap-3 text-center sm:gap-5">
          <div>
            <p className="text-lg font-bold tracking-tight text-foreground">24</p>
            <p className="text-xs text-muted-foreground">Events</p>
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-foreground">8</p>
            <p className="text-xs text-muted-foreground">Staff</p>
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-foreground">94%</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-card sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Security status</p>
            <p className="text-xs text-muted-foreground">
              Last login {formatDateTime(lastLogin.time)} from {lastLogin.device}
            </p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 text-destructive hover:bg-danger/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign Out Everywhere
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign out all sessions?</DialogTitle>
              <DialogDescription>
                This signs you out of every device except this one.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button
                className="gap-2 bg-danger text-white hover:bg-danger/90"
                onClick={() => setDevices((current) => current.filter((d) => d.current))}
              >
                <LogOut className="h-4 w-4" />
                Sign Out Everywhere
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-5">
            <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
              <MonitorSmartphone className="h-4 w-4 text-primary" />
              Active Devices
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Devices currently signed in to your account
            </p>
          </div>
          <div className="space-y-3">
            {devices.map((device) => (
              <DeviceRow
                key={device.id}
                device={device}
                onRevoke={(id) =>
                  setDevices((current) => current.filter((d) => d.id !== id))
                }
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-5">
            <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
              <AlertTriangle className="h-4 w-4 text-danger" />
              Danger Zone
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Irreversible actions for this account
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-foreground">
                Deactivate account
              </p>
              <p className="text-xs text-muted-foreground">
                Temporarily disables portal access
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 border-danger/30 text-destructive hover:bg-danger/10 hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              Deactivate
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="mb-5">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            Login History
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Recent sign-in attempts across all devices
          </p>
        </div>
        <div className="divide-y divide-border">
          {collegeLoginHistory.map((record) => (
            <div key={record.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {record.device}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {record.location} · {record.ip}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {formatDateTime(record.time)}
                </span>
                <StatusBadge status={record.status} dot />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
