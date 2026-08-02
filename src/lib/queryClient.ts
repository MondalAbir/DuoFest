import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/client";

const RETRIABLE_CODES = new Set([
  "request_failed",
  "network_error",
  "timeout",
]);

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (error instanceof ApiError) {
    if (error.status >= 400 && error.status < 500) return false;
    return RETRIABLE_CODES.has(error.code) || error.status >= 500;
  }
  return true;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: shouldRetry,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10_000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
      retryDelay: 750,
    },
  },
});
