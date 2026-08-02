import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  ActivityLog,
  AnalyticsDashboard,
  Attendance,
  AuthUser,
  Certificate,
  College,
  EventCategory,
  EventSponsor,
  FestEvent,
  Paginated,
  PaginationMeta,
  Registration,
  ReportResult,
  ScanResult,
  Transaction,
  User,
  Volunteer,
  VolunteerAssignResult,
  VolunteerProfile,
} from "@/lib/api/types";

export interface ListParams {
  page?: number;
  perPage?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

const DEFAULT_META: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: 0,
  to: 0,
};

function toPaginated<T>(data: T[], meta?: Partial<PaginationMeta>): Paginated<T> {
  return { items: data, meta: { ...DEFAULT_META, ...meta } };
}

export function toQuery(params: ListParams): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== null) {
      searchParams.set(key === "perPage" ? "per_page" : key, String(value));
    }
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export { toPaginated };

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password, deviceName }: { email: string; password: string; deviceName?: string }) =>
      api.post<AuthUser>("/auth/login", { email, password, device_name: deviceName ?? "web" }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: {
      current_password: string;
      password: string;
      password_confirmation: string;
    }) => api.post<null>("/auth/password/change", payload),
  });
}

/* ------------------------------------------------------------------ */
/* Guest registration (OTP flow)                                       */
/* ------------------------------------------------------------------ */

export function useRequestOtp() {
  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: number;
      payload: { email: string; name: string; phone?: string; attendee_details?: Record<string, unknown> };
    }) => api.post<null>(`/events/${eventId}/register/request`, payload),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ eventId, email, otp }: { eventId: number; email: string; otp: string }) =>
      api.post<Registration>(`/events/${eventId}/register/verify`, { email, otp }),
  });
}

/* ------------------------------------------------------------------ */
/* Colleges                                                            */
/* ------------------------------------------------------------------ */

export function useColleges(params: ListParams = {}) {
  return useQuery({
    queryKey: ["colleges", params],
    queryFn: async () => {
      return api.list<College>(`/colleges${toQuery(params)}`);
    },
    placeholderData: keepPreviousData,
  });
}

export function useCollege(id: number | string | undefined) {
  return useQuery({
    queryKey: ["colleges", id],
    queryFn: () => api.get<College>(`/colleges/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateCollege() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post<College>("/colleges", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["colleges"] }),
  });
}

export function useUpdateCollege() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      api.put<College>(`/colleges/${id}`, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      queryClient.invalidateQueries({ queryKey: ["colleges", id] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Event categories                                                    */
/* ------------------------------------------------------------------ */

export function useEventCategories() {
  return useQuery({
    queryKey: ["event-categories"],
    queryFn: async () => {
      return api.list<EventCategory>("/event-categories?per_page=100");
    },
  });
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export function useEvents(params: ListParams = {}) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: async () => {
      return api.list<FestEvent>(`/events${toQuery(params)}`);
    },
    placeholderData: keepPreviousData,
  });
}

export function useEvent(id: number | string | undefined) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: () => api.get<FestEvent>(`/events/${id}`),
    enabled: Boolean(id),
  });
}

export function useEventBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["events", "slug", slug],
    queryFn: () => api.get<FestEvent>(`/events/slug/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useFeaturedEvents(params: ListParams = {}) {
  return useQuery({
    queryKey: ["events", "featured", params],
    queryFn: async () => {
      return api.list<FestEvent>(`/events/featured${toQuery({ per_page: 6, ...params })}`);
    },
  });
}

export function useUpcomingEvents(params: ListParams = {}) {
  return useQuery({
    queryKey: ["events", "upcoming", params],
    queryFn: async () => {
      return api.list<FestEvent>(`/events/upcoming${toQuery({ per_page: 6, ...params })}`);
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post<FestEvent>("/events", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      api.put<FestEvent>(`/events/${id}`, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<null>(`/events/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post<FestEvent>(`/events/${id}/publish`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", id] });
    },
  });
}

export function useArchiveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post<FestEvent>(`/events/${id}/archive`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", id] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Registrations                                                       */
/* ------------------------------------------------------------------ */

export function useRegistrations(params: ListParams = {}) {
  return useQuery({
    queryKey: ["registrations", params],
    queryFn: async () => {
      return api.list<Registration>(`/registrations${toQuery(params)}`);
    },
    placeholderData: keepPreviousData,
  });
}

export function useRegistration(id: number | string | undefined) {
  return useQuery({
    queryKey: ["registrations", id],
    queryFn: () => api.get<Registration>(`/registrations/${id}`),
    enabled: Boolean(id),
  });
}

export function useCancelRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post<Registration>(`/registrations/${id}/cancel`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["registrations", id] });
      invalidateChildQueries(queryClient, ["events"]);
    },
  });
}

export function useCheckInRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post<Registration>(`/registrations/${id}/check-in`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["registrations", id] });
      invalidateChildQueries(queryClient, ["events"]);
    },
  });
}

/* ------------------------------------------------------------------ */
/* Transactions / payments                                             */
/* ------------------------------------------------------------------ */

export function useTransactions(params: ListParams = {}) {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: async () => {
      return api.list<Transaction>(`/transactions${toQuery(params)}`);
    },
    placeholderData: keepPreviousData,
  });
}

export function useRecordTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      registrationId,
      payload,
    }: {
      eventId: number;
      registrationId: number;
      payload: Record<string, unknown>;
    }) =>
      api.post<Transaction>(
        `/events/${eventId}/registrations/${registrationId}/transactions`,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      invalidateChildQueries(queryClient, ["events"]);
    },
  });
}

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

export type ReportType =
  | "attendance"
  | "revenue"
  | "registrations"
  | "events"
  | "volunteers"
  | "certificates";

export interface ReportFilters {
  event_id?: number;
  college_id?: number;
  status?: string;
  from?: string;
  to?: string;
}

export function useReport(report: ReportType, filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ["reports", report, filters],
    queryFn: () => api.get<ReportResult>(`/reports/${report}${toQuery(filters as ListParams)}`),
    enabled: Boolean(report),
  });
}

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => api.get<AnalyticsDashboard>("/analytics/dashboard"),
    staleTime: 30_000,
  });
}

/* ------------------------------------------------------------------ */
/* Activity logs                                                       */
/* ------------------------------------------------------------------ */

export function useActivityLogs(params: ListParams = {}) {
  return useQuery({
    queryKey: ["activity-logs", params],
    queryFn: async () => {
      return api.list<ActivityLog>(`/activity-logs${toQuery(params)}`);
    },
    placeholderData: keepPreviousData,
  });
}

/* ------------------------------------------------------------------ */
/* College admins                                                      */
/* ------------------------------------------------------------------ */

export function useCollegeAdmins(params: ListParams = {}) {
  return useQuery({
    queryKey: ["college-admins", params],
    queryFn: async () => {
      return api.list<User>(`/college-admins${toQuery(params)}`);
    },
    placeholderData: keepPreviousData,
  });
}

export function useInviteCollegeAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; name?: string; college_id?: number }) =>
      api.post<null>("/college-admins/invite", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["college-admins"] }),
  });
}

/* ------------------------------------------------------------------ */
/* Volunteers (admin + portal)                                         */
/* ------------------------------------------------------------------ */

export function useEventVolunteers(eventId: number | undefined) {
  return useQuery({
    queryKey: ["volunteers", eventId],
    queryFn: () => api.get<Volunteer[]>(`/events/${eventId}/volunteers`),
    enabled: Boolean(eventId),
  });
}

export function useMyVolunteering() {
  return useQuery({
    queryKey: ["volunteer", "my-volunteering"],
    queryFn: () => api.get<Volunteer[]>("/volunteer/my-volunteering"),
  });
}

export function useVolunteerProfile() {
  return useQuery({
    queryKey: ["volunteer", "profile"],
    queryFn: () => api.get<VolunteerProfile>("/volunteer/profile"),
  });
}

export function useAssignedEvents() {
  return useQuery({
    queryKey: ["volunteer", "assigned-events"],
    queryFn: () => api.get<Volunteer[]>("/volunteer/assigned-events"),
  });
}

export function useTodayEntries() {
  return useQuery({
    queryKey: ["volunteer", "today-entries"],
    queryFn: () => api.get<Attendance[]>("/volunteer/today-entries"),
  });
}

export function useValidateScan() {
  return useMutation({
    mutationFn: ({ eventId, payload }: { eventId: number; payload: string }) =>
      api.post<ScanResult>(`/volunteer/scan/${eventId}/validate`, { payload }),
  });
}

export function useCheckInScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, payload }: { eventId: number; payload: string }) =>
      api.post<Attendance>(`/volunteer/scan/${eventId}/check-in`, { payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteer", "today-entries"] });
      queryClient.invalidateQueries({ queryKey: ["volunteer", "profile"] });
    },
  });
}

export function useAssignVolunteers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: number;
      payload: { user_ids: number[]; role?: string; notes?: string };
    }) => api.post<VolunteerAssignResult>(`/events/${eventId}/volunteers/assign`, payload),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["volunteers", eventId] });
      invalidateChildQueries(queryClient, ["events"]);
    },
  });
}

/* ------------------------------------------------------------------ */
/* Certificates                                                        */
/* ------------------------------------------------------------------ */

export function useEventCertificates(eventId: number | undefined, params: ListParams = {}) {
  return useQuery({
    queryKey: ["certificates", eventId, params],
    queryFn: async () => {
      return api.list<Certificate>(`/events/${eventId}/certificates${toQuery(params)}`);
    },
    enabled: Boolean(eventId),
  });
}

/* ------------------------------------------------------------------ */
/* Sponsors                                                            */
/* ------------------------------------------------------------------ */

export function useEventSponsors(eventId: number | undefined, params: ListParams = {}) {
  return useQuery({
    queryKey: ["sponsors", eventId, params],
    queryFn: async () => {
      return api.list<EventSponsor>(`/events/${eventId}/sponsors${toQuery(params)}`);
    },
    enabled: Boolean(eventId),
  });
}

function invalidateChildQueries(queryClient: QueryClient, keys: string[]): void {
  for (const key of keys) {
    queryClient.invalidateQueries({ queryKey: [key], predicate: (query) => {
      const qKey = query.queryKey[0];
      return qKey === key && query.queryKey.length > 1;
    } });
  }
}
