import axios, { AxiosError } from "axios";
import type { PaginationMeta } from "@/lib/api/types";

export const TOKEN_KEY = "duofest_token";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface ApiErrorPayload {
  success: boolean;
  code: string;
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  code: string;
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, code: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.errors = errors;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export const authEvents = new EventTarget();

export const TOKEN_EXPIRED_EVENT = "token-expired";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope>) => {
    const payload = error.response?.data;
    const status = error.response?.status ?? 0;
    const message = payload?.message ?? error.message ?? "Something went wrong";
    const code = payload?.code ?? (status === 401 ? "unauthenticated" : "request_failed");

    if (status === 401) {
      setToken(null);
      authEvents.dispatchEvent(new Event(TOKEN_EXPIRED_EVENT));
    }

    const apiError = new ApiError(message, code, status, payload?.errors);
    return Promise.reject(apiError);
  },
);

/**
 * Type-safe request helper that unwraps the API envelope.
 * `response.data` holds the server `data` payload.
 */
async function request<T>(config: Parameters<typeof apiClient.request>[0]): Promise<T> {
  const response = await apiClient.request<ApiEnvelope<T>>(config);
  return response.data.data;
}

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: 0,
  to: 0,
};

export interface ListResult<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Request helper for paginated endpoints that returns both the items and the
 * pagination meta from the API envelope.
 */
async function listRequest<T>(
  config: Parameters<typeof apiClient.request>[0],
): Promise<ListResult<T>> {
  const response = await apiClient.request<ApiEnvelope<T[]>>(config);
  const envelope = response.data;
  return {
    items: Array.isArray(envelope.data) ? envelope.data : [],
    meta: envelope.meta ?? EMPTY_META,
  };
}

export const api = {
  get: <T>(url: string, config?: Parameters<typeof apiClient.get>[1]) =>
    request<T>({ ...config, method: "GET", url }),
  list: <T>(url: string, config?: Parameters<typeof apiClient.get>[1]) =>
    listRequest<T>({ ...config, method: "GET", url }),
  post: <T>(url: string, data?: unknown, config?: Parameters<typeof apiClient.post>[2]) =>
    request<T>({ ...config, method: "POST", url, data }),
  put: <T>(url: string, data?: unknown, config?: Parameters<typeof apiClient.put>[2]) =>
    request<T>({ ...config, method: "PUT", url, data }),
  patch: <T>(url: string, data?: unknown, config?: Parameters<typeof apiClient.patch>[2]) =>
    request<T>({ ...config, method: "PATCH", url, data }),
  delete: <T>(url: string, config?: Parameters<typeof apiClient.delete>[1]) =>
    request<T>({ ...config, method: "DELETE", url }),
};

export default apiClient;
