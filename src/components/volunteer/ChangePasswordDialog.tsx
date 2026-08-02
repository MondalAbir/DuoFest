import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2, Loader2, LockKeyhole } from "lucide-react";
import { useChangePassword } from "@/lib/hooks";
import { toastApiError, toastError, toastSuccess } from "@/lib/toast";
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

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Current password must be at least 8 characters"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(64, "New password must be under 64 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const defaultValues: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const changePassword = useChangePassword();

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

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await changePassword.mutateAsync({
        current_password: values.currentPassword,
        password: values.newPassword,
        password_confirmation: values.confirmPassword,
      });
      toastSuccess("Password updated");
      setIsSubmitting(false);
      form.reset(defaultValues);
      onOpenChange(false);
      setShowSuccess(true);
    } catch (error) {
      toastApiError(error, "Unable to change password");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md gap-0 p-0">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <LockKeyhole className="h-4 w-4 text-primary" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Update the password for your volunteer account.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 px-6 py-5"
          >
            <TextField
              name="currentPassword"
              control={form.control}
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              autoComplete="current-password"
            />
            <TextField
              name="newPassword"
              control={form.control}
              label="New Password"
              type="password"
              placeholder="Enter new password"
              autoComplete="new-password"
            />
            <TextField
              name="confirmPassword"
              control={form.control}
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
            <DialogFooter className="gap-2 border-t border-border pt-4">
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
                {isSubmitting ? "Updating…" : "Update Password"}
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
              Password Updated
            </DialogTitle>
            <DialogDescription>
              Your password has been changed successfully. Use it next time you
              sign in to the portal.
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
