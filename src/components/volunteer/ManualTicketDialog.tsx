import { useEffect, useState } from "react";
import { ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ManualTicketDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (ticketId: string) => void;
}) {
  const [ticketId, setTicketId] = useState("");

  useEffect(() => {
    if (open) setTicketId("");
  }, [open]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const id = ticketId.trim().toUpperCase();
    if (!id) return;
    onSubmit(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="gap-1 border-b border-border px-5 py-4">
            <DialogTitle className="flex items-center gap-2 text-base">
              <ScanSearch className="h-4 w-4 text-primary" />
              Enter Ticket ID
            </DialogTitle>
            <DialogDescription>
              Type the ticket ID printed on the pass (e.g. DF-8843).
            </DialogDescription>
          </DialogHeader>
          <div className="px-5 py-4">
            <Input
              value={ticketId}
              onChange={(event) => setTicketId(event.target.value)}
              placeholder="DF-0000"
              aria-label="Ticket ID"
              autoFocus
              autoComplete="off"
              className="h-12 rounded-xl text-base uppercase tracking-wide"
            />
          </div>
          <DialogFooter className="gap-2 border-t border-border px-5 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!ticketId.trim()}
              className="min-w-[120px] gap-2"
            >
              <ScanSearch className="h-4 w-4" />
              Verify
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
