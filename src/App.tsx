import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { CollegeLayout } from "@/layouts/CollegeLayout";
import { VolunteerLayout } from "@/layouts/VolunteerLayout";
import { LandingLayout } from "@/layouts/LandingLayout";
import { PageLoader } from "@/components/common/PageLoader";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";

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

const HomePage = lazy(() =>
  import("@/pages/landing/HomePage").then((m) => ({ default: m.HomePage })),
);
const EventsLandingPage = lazy(() =>
  import("@/pages/landing/EventsPage").then((m) => ({ default: m.EventsPage })),
);
const EventDetailsLandingPage = lazy(() =>
  import("@/pages/landing/EventDetailsPage").then((m) => ({
    default: m.EventDetailsPage,
  })),
);
const RegisterPage = lazy(() =>
  import("@/pages/landing/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  })),
);
const OtpPage = lazy(() =>
  import("@/pages/landing/OtpPage").then((m) => ({ default: m.OtpPage })),
);
const SuccessPage = lazy(() =>
  import("@/pages/landing/SuccessPage").then((m) => ({
    default: m.SuccessPage,
  })),
);
const ForCollegesPage = lazy(() =>
  import("@/pages/landing/ForCollegesPage").then((m) => ({
    default: m.ForCollegesPage,
  })),
);
const AboutPage = lazy(() =>
  import("@/pages/landing/AboutPage").then((m) => ({ default: m.AboutPage })),
);
const ContactPage = lazy(() =>
  import("@/pages/landing/ContactPage").then((m) => ({
    default: m.ContactPage,
  })),
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/college" element={<LoginPage portal="college" />} />
        <Route path="/login/volunteer" element={<LoginPage portal="volunteer" />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["super_admin", "event_manager"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
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

        <Route
          path="/admin/college"
          element={
            <ProtectedRoute roles={["super_admin", "college_admin", "event_manager"]}>
              <CollegeLayout />
            </ProtectedRoute>
          }
        >
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

        <Route
          path="/admin/volunteer"
          element={
            <ProtectedRoute roles={["super_admin", "volunteer"]}>
              <VolunteerLayout />
            </ProtectedRoute>
          }
        >
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

        <Route element={<LandingLayout />}>
          <Route index element={<HomePage />} />
          <Route path="events" element={<EventsLandingPage />} />
          <Route path="events/:slug" element={<EventDetailsLandingPage />} />
          <Route path="register/:slug" element={<RegisterPage />} />
          <Route path="verify" element={<OtpPage />} />
          <Route path="success" element={<SuccessPage />} />
          <Route path="for-colleges" element={<ForCollegesPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
