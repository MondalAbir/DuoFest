import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Copy,
  Loader2,
  Lock,
  Mail,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TextField } from "@/components/forms/TextField";
import { SelectField } from "@/components/forms/SelectField";
import { SwitchField } from "@/components/forms/SwitchField";
import { CheckboxGroupField } from "@/components/forms/CheckboxGroupField";
import { SearchableSelectField } from "@/components/forms/SearchableSelectField";
import { FormField } from "@/components/forms/FormField";
import { LogoUploader } from "@/components/colleges/LogoUploader";
import { SectionHeading } from "@/components/colleges/SectionHeading";
import {
  ADMIN_ROLES,
  inviteAdminDefaultValues,
  inviteAdminSchema,
  INVITE_STATUS,
  PERMISSIONS,
  type InviteAdminFormValues,
} from "@/components/colleges/inviteAdminSchema";
import { colleges } from "@/data/colleges";

interface InviteCollegeAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCollegeId?: string;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const collegeOptions = colleges.map((college) => ({
  value: college.id,
  label: college.name,
}));

export function InviteCollegeAdminDialog({
  open,
  onOpenChange,
  defaultCollegeId,
}: InviteCollegeAdminDialogProps) {
  const form = useForm<InviteAdminFormValues>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: inviteAdminDefaultValues,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      form.reset(inviteAdminDefaultValues);
      if (defaultCollegeId) {
        form.setValue("collegeId", defaultCollegeId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultCollegeId]);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      onOpenChange(true);
      return;
    }
    if (isSubmitting) return;
    form.reset(inviteAdminDefaultValues);
    onOpenChange(false);
  };

  const onSubmit = async (values: InviteAdminFormValues) => {
    setIsSubmitting(true);
    await wait(1400);
    // Dummy submission – replace with an API call later.
    console.log("Admin invitation sent (dummy):", values);
    setIsSubmitting(false);
    onOpenChange(false);
    setShowSuccess(true);
  };

  const invitationLink = `https://duofest.app/join?invite=${Math.random()
    .toString(36)
    .slice(2, 10)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-h-[90vh] max-w-[640px] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0"
          aria-describedby="invite-admin-description"
        >
          <DialogHeader className="border-b border-border px-6 pb-4 pr-14 pt-5">
            <DialogTitle className="text-base">Invite College Admin</DialogTitle>
            <DialogDescription id="invite-admin-description">
              Add a new admin for a college and configure their access.
            </DialogDescription>
          </DialogHeader>

          <form
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="scrollbar-thin min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-5">
              <section className="space-y-5">
                <SectionHeading
                  icon={UserRound}
                  title="Admin Details"
                  description="Personal and contact information"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    name="photo"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="sm:col-span-2">
                        <FormField
                          label="Profile Photo"
                          htmlFor="invite-photo"
                          optional
                        >
                          <LogoUploader
                            id="invite-photo"
                            name="photo"
                            title="Drag & drop profile photo"
                            hint="PNG, JPG or WebP up to 2 MB."
                            value={field.value ?? null}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                          />
                        </FormField>
                      </div>
                    )}
                  />
                  <TextField
                    name="fullName"
                    control={form.control}
                    label="Full Name"
                    placeholder="e.g. Aarav Sharma"
                    autoFocus
                    className="sm:col-span-2"
                  />
                  <TextField
                    name="email"
                    control={form.control}
                    label="Email"
                    type="email"
                    placeholder="admin@college.edu"
                  />
                  <TextField
                    name="phone"
                    control={form.control}
                    label="Phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </section>

              <section className="space-y-5">
                <SectionHeading
                  icon={Building2}
                  title="Assignment"
                  description="Choose which college this admin manages"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SearchableSelectField
                    name="collegeId"
                    control={form.control}
                    label="Assign College"
                    options={collegeOptions}
                    searchPlaceholder="Search colleges…"
                    placeholder="Search and select a college…"
                    className="sm:col-span-2"
                  />
                  <SelectField
                    name="role"
                    control={form.control}
                    label="Role"
                    placeholder="Select role"
                    className="sm:col-span-2"
                    options={ADMIN_ROLES.map((role) => ({
                      value: role,
                      label: role,
                    }))}
                  />
                </div>
              </section>

              <section className="space-y-5">
                <SectionHeading
                  icon={ShieldCheck}
                  title="Permissions"
                  description="What this admin is allowed to manage"
                />
                <CheckboxGroupField
                  name="permissions"
                  control={form.control}
                  label="Access Permissions"
                  options={PERMISSIONS.map((permission) => ({
                    value: permission.value,
                    label: permission.label,
                  }))}
                />
              </section>

              <section className="space-y-5">
                <SectionHeading
                  icon={Lock}
                  title="Security"
                  description="Authentication and notification preferences"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SwitchField
                    name="requirePasswordChange"
                    control={form.control}
                    label="Require Password Change"
                    description="Admin must set a new password on first login"
                    className="sm:col-span-2"
                  />
                  <SwitchField
                    name="sendInvitationEmail"
                    control={form.control}
                    label="Send Invitation Email"
                    description="Email the invitation link to this admin"
                    className="sm:col-span-2"
                  />
                </div>
              </section>

              <section className="space-y-5">
                <SectionHeading
                  icon={BadgeCheck}
                  title="Status"
                  description="Initial status for the new admin account"
                />
                <SelectField
                  name="status"
                  control={form.control}
                  label="Status"
                  placeholder="Select status"
                  options={INVITE_STATUS.map((status) => ({
                    value: status,
                    label: status.charAt(0).toUpperCase() + status.slice(1),
                  }))}
                />
              </section>
            </div>

            <DialogFooter className="border-t border-border bg-muted/20 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenChange.bind(null, false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-w-[130px] gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Invite Admin
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showSuccess}
        onOpenChange={(next) => {
          if (!next) setShowSuccess(false);
        }}
      >
        <DialogContent className="max-w-md text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success"
          >
            <CheckCircle2 className="h-8 w-8" />
          </motion.div>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-lg">
              Invitation Sent Successfully
            </DialogTitle>
            <DialogDescription>
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <Mail className="h-4 w-4 text-primary" />
                {form.getValues("email")}
              </span>
              <span className="mt-1.5 block">
                The invitation link expires in 72 hours.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button className="gap-2" onClick={handleCopyLink}>
              {copied ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Link Copied!" : "Copy Invitation Link"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSuccess(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
