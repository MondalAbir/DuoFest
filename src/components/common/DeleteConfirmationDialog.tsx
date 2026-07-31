import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  confirmText?: string;
  onConfirm?: () => void | Promise<void>;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title = "Delete College",
  description = "This action cannot be undone.",
  confirmLabel = "Delete College",
  confirmText = "DELETE",
  onConfirm,
}: DeleteConfirmationDialogProps) {
  const [typed, setTyped] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      onOpenChange(true);
      return;
    }
    if (isDeleting) return;
    onOpenChange(false);
  };

  const matched = typed === confirmText;

  const handleConfirm = async () => {
    if (!matched || isDeleting) return;
    setIsDeleting(true);
    await wait(1400);
    // Dummy deletion – replace with an API call later.
    console.log(`${confirmLabel} confirmed (dummy):`, { confirmText: typed });
    setIsDeleting(false);
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <DialogHeader className="items-center text-center">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label
            htmlFor="delete-confirm"
            className="block text-sm font-medium text-foreground"
          >
            Type{" "}
            <span className="font-semibold tracking-wide text-destructive">
              {confirmText}
            </span>{" "}
            to confirm
          </label>
          <Input
            id="delete-confirm"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={`Type ${confirmText} to continue`}
            disabled={isDeleting}
            className={cn(
              "text-center font-semibold tracking-[0.2em] uppercase",
              typed.length > 0 && !matched && "border-destructive/60",
            )}
          />
        </div>

        <DialogFooter className="gap-2 sm:justify-center">
          <Button
            variant="outline"
            className="flex-1"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1 gap-2"
            disabled={!matched || isDeleting}
            onClick={handleConfirm}
          >
            {isDeleting && <Loader2 className="animate-spin" />}
            {isDeleting ? "Deleting…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
