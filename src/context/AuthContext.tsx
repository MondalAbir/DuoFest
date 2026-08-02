import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, TOKEN_EXPIRED_EVENT, authEvents, getToken, setToken } from "@/lib/api/client";
import type { AuthUser, User, UserRole } from "@/lib/api/types";

interface AuthContextValue {
  user: User | null;
  roles: UserRole[];
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, deviceName?: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AUTH_ME_KEY = ["auth", "me"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [auth, setAuth] = useState<AuthUser | null>(() => {
    if (!getToken()) return null;
    return null;
  });

  const {
    data: me,
    isLoading,
    isError,
  } = useQuery({
    queryKey: AUTH_ME_KEY,
    queryFn: () => api.get<User>("/auth/me"),
    enabled: Boolean(getToken()),
    retry: false,
    staleTime: 60_000,
  });

  const handleExpired = useCallback(() => {
    setToken(null);
    setAuth(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    authEvents.addEventListener(TOKEN_EXPIRED_EVENT, handleExpired);
    return () => authEvents.removeEventListener(TOKEN_EXPIRED_EVENT, handleExpired);
  }, [handleExpired]);

  const login = useCallback(
    async (email: string, password: string, deviceName = "web"): Promise<AuthUser> => {
      const result = await api.post<AuthUser>("/auth/login", { email, password, device_name: deviceName });
      setToken(result.token);
      setAuth(result);
      queryClient.setQueryData(AUTH_ME_KEY, result.user);
      return result;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore — always clear local session.
    }
    setToken(null);
    setAuth(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(() => {
    const user = auth?.user ?? me ?? null;
    const roles = (user?.roles ?? []) as UserRole[];

    return {
      user,
      roles,
      permissions: auth?.permissions ?? [],
      isAuthenticated: Boolean(user),
      isLoading: isLoading && Boolean(getToken()) && !isError,
      login,
      logout,
      hasRole: (...wanted) => wanted.some((role) => roles.includes(role)),
      hasPermission: (permission) =>
        Boolean(auth?.permissions.includes(permission)) || roles.includes("super_admin"),
    };
  }, [auth, me, isLoading, isError, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
