import { Link } from "react-router";
import { motion } from "framer-motion";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-danger/10 text-danger">
          <ShieldX className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Access denied
          </h1>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Your account doesn't have permission to view this section. Contact
            your administrator if you believe this is a mistake.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      </motion.div>
    </div>
  );
}
