import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2, Loader2, Wand2 } from "lucide-react";
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
import { SwitchField } from "@/components/forms/SwitchField";
import { SectionHeading } from "@/components/colleges/SectionHeading";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const PASSWORD_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*";

export function generatePassword(length = 16): string {
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (value) => PASSWORD_CHARS[value % PASSWORD_CHARS.length]).join("");
}

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password must be under 64 characters"),
    confirmPassword: z.string(),
    requirePasswordChange: z.boolean(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const defaultValues: ResetPasswordFormValues = {
  newPassword: "",
  confirmPassword: "",
  requirePasswordChange: true,
};

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminName?: string;
  adminEmail?: string;
  subject?: string;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  adminName,
  adminEmail,
  subject = "admin",
}: ResetPasswordDialogProps) {
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (open) form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      onOpenChange(true);
      return;
    }
    if (isSubmitting) return;
    form.reset(defaultValues);
    onOpenChange(false);
  };

  const handleGenerate = () => {
    const password = generatePassword();
    form.setValue("newPassword", password);
    form.setValue("confirmPassword", password);
    form.clearErrors(["newPassword", "confirmPassword"]);
  };

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    await wait(1400);
    // Dummy submission – replace with an API call later.
    console.log("Password reset (dummy):", {
      admin: adminEmail ?? "unknown",
      requirePasswordChange: values.requirePasswordChange,
    });
    setIsSubmitting(false);
    form.reset(defaultValues);
    onOpenChange(false);
    setShowSuccess(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-h-[90vh] max-w-[560px] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0"
          aria-describedby="reset-password-description"
        >
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle className="text-lg">Reset Password</DialogTitle>
            <DialogDescription id="reset-password-description">
              Set a new password for {adminName ?? `this ${subject}`}.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="scrollbar-thin min-h-0 flex-1 overflow-y-auto"
          >
            <div className="space-y-6 px-6 py-5">
              <section className="space-y-5">
                <SectionHeading
                  icon={Wand2}
                  title="New Credentials"
                  description="Choose a strong password or generate one"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    name="newPassword"
                    control={form.control}
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="sm:col-span-2"
                  />
                  <TextField
                    name="confirmPassword"
                    control={form.control}
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    className="sm:col-span-2"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleGenerate}
                >
                  <Wand2 className="h-4 w-4" />
                  Generate Random Password
                </Button>
              </section>

              <section className="space-y-5">
                <SectionHeading
                  icon={CheckCircle2}
                  title="Security"
                  description={`Force the ${subject} to set a new password on next login`}
                />
                <SwitchField
                  name="requirePasswordChange"
                  control={form.control}
                  label="Require Password Change"
                  description={`${subject[0].toUpperCase()}${subject.slice(1)} must set a new password on first login`}
                />
              </section>
            </div>

            <DialogFooter className="gap-2 border-t border-border px-6 py-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-w-[140px] gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="animate-spin" />}
                {isSubmitting ? "Resetting…" : "Reset Password"}
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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-lg">
              Password Reset Successful
            </DialogTitle>
            <DialogDescription>
              <span className="block font-medium text-foreground">
                {adminEmail ?? `The ${subject}`}
              </span>
              <span className="mt-1.5 block">
                A password reset link has been sent to their email.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button onClick={() => setShowSuccess(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
