import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/api/types";
import { PageLoader } from "@/components/common/PageLoader";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

/**
 * Blocks unauthenticated users and optionally restricts to a set of roles.
 * Redirects to /login with the intended location for post-login return.
 */
export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
