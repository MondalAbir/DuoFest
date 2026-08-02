import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

export { Toaster } from "sonner";

export function toastSuccess(message: string): void {
  toast.success(message);
}

export function toastError(message: string): void {
  toast.error(message);
}

export function toastInfo(message: string): void {
  toast.info(message);
}

/**
 * Show a toast for an unknown error. Prefers the server-provided message
 * (message field), falling back to a field-errors summary.
 */
export function toastApiError(error: unknown, fallback = "Something went wrong."): void {
  if (error instanceof ApiError) {
    if (error.errors) {
      const firstField = Object.entries(error.errors)[0];
      if (firstField) {
        toast.error(firstField[1][0] ?? error.message);
        return;
      }
    }
    toast.error(error.message || fallback);
    return;
  }
  toast.error(error instanceof Error ? error.message : fallback);
}
