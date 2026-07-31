import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { CollegeLayout } from "@/layouts/CollegeLayout";
import { VolunteerLayout } from "@/layouts/VolunteerLayout";
import { PageLoader } from "@/components/common/PageLoader";

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const CollegesPage = lazy(() => import("@/pages/CollegesPage"));
const CollegeAdminsPage = lazy(() => import("@/pages/CollegeAdminsPage"));
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const CreateEventPage = lazy(() => import("@/pages/CreateEventPage"));
const EventDetailsPage = lazy(() => import("@/pages/EventDetailsPage"));
const RegistrationsPage = lazy(() => import("@/pages/RegistrationsPage"));
const UsersPage = lazy(() => import("@/pages/UsersPage"));
const VolunteersPage = lazy(() => import("@/pages/VolunteersPage"));
const PaymentsPage = lazy(() => import("@/pages/PaymentsPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const AnnouncementsPage = lazy(() => import("@/pages/AnnouncementsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const ActivityLogsPage = lazy(() => import("@/pages/ActivityLogsPage"));
const CollegeDashboardPage = lazy(
  () => import("@/pages/college/CollegeDashboardPage"),
);
const CollegePlaceholderPage = lazy(
  () => import("@/pages/college/CollegePlaceholderPage"),
);
const CollegeAllEventsPage = lazy(
  () => import("@/pages/college/CollegeAllEventsPage"),
);
const CollegeCreateEventPage = lazy(
  () => import("@/pages/college/CollegeCreateEventPage"),
);
const CollegeMyEventsPage = lazy(
  () => import("@/pages/college/CollegeMyEventsPage"),
);
const CollegeEventDetailsPage = lazy(
  () => import("@/pages/college/CollegeEventDetailsPage"),
);
const CollegeRegistrationsPage = lazy(
  () => import("@/pages/college/CollegeRegistrationsPage"),
);
const CollegeCheckInHistoryPage = lazy(
  () => import("@/pages/college/CollegeCheckInHistoryPage"),
);
const CollegeVolunteersPage = lazy(
  () => import("@/pages/college/CollegeVolunteersPage"),
);
const CollegeStudentsPage = lazy(
  () => import("@/pages/college/CollegeStudentsPage"),
);
const CollegeCertificatesPage = lazy(
  () => import("@/pages/college/CollegeCertificatesPage"),
);
const CollegeSponsorsPage = lazy(
  () => import("@/pages/college/CollegeSponsorsPage"),
);
const CollegeGalleryPage = lazy(
  () => import("@/pages/college/CollegeGalleryPage"),
);
const CollegeAnnouncementsPage = lazy(
  () => import("@/pages/college/CollegeAnnouncementsPage"),
);
const CollegeReportsPage = lazy(
  () => import("@/pages/college/CollegeReportsPage"),
);
const CollegeSettingsPage = lazy(
  () => import("@/pages/college/CollegeSettingsPage"),
);
const CollegeProfilePage = lazy(
  () => import("@/pages/college/CollegeProfilePage"),
);
const VolunteerDashboardPage = lazy(
  () => import("@/pages/volunteer/VolunteerDashboardPage"),
);
const VolunteerScanPage = lazy(
  () => import("@/pages/volunteer/VolunteerScanPage"),
);
const VolunteerEntriesPage = lazy(
  () => import("@/pages/volunteer/VolunteerEntriesPage"),
);
const VolunteerProfilePage = lazy(
  () => import("@/pages/volunteer/VolunteerProfilePage"),
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="colleges" element={<CollegesPage />} />
          <Route path="admins" element={<CollegeAdminsPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/create" element={<CreateEventPage />} />
          <Route path="events/:eventId" element={<EventDetailsPage />} />
          <Route path="registrations" element={<RegistrationsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="volunteers" element={<VolunteersPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="activity-logs" element={<ActivityLogsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
        <Route path="/admin/college" element={<CollegeLayout />}>
          <Route index element={<CollegeDashboardPage />} />
          <Route path="events" element={<CollegeAllEventsPage />} />
          <Route path="events/create" element={<CollegeCreateEventPage />} />
          <Route path="events/:eventId" element={<CollegeEventDetailsPage />} />
          <Route path="my-events" element={<CollegeMyEventsPage />} />
          <Route path="registrations" element={<CollegeRegistrationsPage />} />
          <Route path="check-in" element={<CollegeCheckInHistoryPage />} />
          <Route path="volunteers" element={<CollegeVolunteersPage />} />
          <Route path="students" element={<CollegeStudentsPage />} />
          <Route path="certificates" element={<CollegeCertificatesPage />} />
          <Route path="sponsors" element={<CollegeSponsorsPage />} />
          <Route path="gallery" element={<CollegeGalleryPage />} />
          <Route path="announcements" element={<CollegeAnnouncementsPage />} />
          <Route path="reports" element={<CollegeReportsPage />} />
          <Route path="settings" element={<CollegeSettingsPage />} />
          <Route path="profile" element={<CollegeProfilePage />} />
          <Route path="logout" element={<CollegePlaceholderPage />} />
          <Route path="*" element={<Navigate to="/admin/college" replace />} />
        </Route>
        <Route path="/admin/volunteer" element={<VolunteerLayout />}>
          <Route index element={<Navigate to="scan" replace />} />
          <Route path="dashboard" element={<VolunteerDashboardPage />} />
          <Route path="scan" element={<VolunteerScanPage />} />
          <Route path="entries" element={<VolunteerEntriesPage />} />
          <Route path="profile" element={<VolunteerProfilePage />} />
          <Route
            path="*"
            element={<Navigate to="/admin/volunteer/scan" replace />}
          />
        </Route>
        <Route
          path="*"
          element={
            <Navigate
              to="/admin"
              replace
              state={{ from: "unknown" }}
            />
          }
        />
      </Routes>
    </Suspense>
  );
}
