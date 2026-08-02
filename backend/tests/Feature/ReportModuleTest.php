<?php

namespace Tests\Feature;

use App\Enums\AttendanceStatus;
use App\Enums\CertificateStatus;
use App\Enums\RegistrationStatus;
use App\Enums\UserRole;
use App\Enums\VolunteerStatus;
use App\Models\Attendance;
use App\Models\Certificate;
use App\Models\College;
use App\Models\Event;
use App\Models\Registration;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Volunteer;
use Tests\TestCase;

class ReportModuleTest extends TestCase
{
    private function manager(): User
    {
        return $this->createUser([], UserRole::EVENT_MANAGER->value);
    }

    private function event(array $attributes = []): Event
    {
        return Event::factory()->published()->create($attributes);
    }

    public function test_attendance_report_aggregates_per_event(): void
    {
        $event = $this->event();

        $present = Registration::factory()->create(['event_id' => $event->id, 'status' => RegistrationStatus::CHECKED_IN->value]);
        $late = Registration::factory()->create(['event_id' => $event->id, 'status' => RegistrationStatus::CHECKED_IN->value]);
        $excused = Registration::factory()->create(['event_id' => $event->id, 'status' => RegistrationStatus::CHECKED_IN->value]);
        $noShow = Registration::factory()->create(['event_id' => $event->id, 'status' => RegistrationStatus::CONFIRMED->value]);

        Attendance::factory()->forRegistration($present)->create(['status' => AttendanceStatus::PRESENT->value]);
        Attendance::factory()->forRegistration($late)->create(['status' => AttendanceStatus::LATE->value]);
        Attendance::factory()->forRegistration($excused)->create(['status' => AttendanceStatus::EXCUSED->value]);

        $this->actingAsApi($this->manager())
            ->getJson("/api/v1/reports/attendance?event_id={$event->id}")
            ->assertOk()
            ->assertJsonPath('data.type', 'attendance')
            ->assertJsonPath('data.rows.0.registered', 4)
            ->assertJsonPath('data.rows.0.present', 1)
            ->assertJsonPath('data.rows.0.late', 1)
            ->assertJsonPath('data.rows.0.excused', 1)
            ->assertJsonPath('data.rows.0.attended', 2)
            ->assertJsonPath('data.rows.0.attendance_rate', 50)
            ->assertJsonPath('data.summary.events', 1)
            ->assertJsonPath('data.summary.attendance_rate', 50);
    }

    public function test_registrations_report_breaks_down_by_status_and_guest(): void
    {
        $event = $this->event();

        Registration::factory()->create(['event_id' => $event->id, 'status' => RegistrationStatus::PENDING->value]);
        Registration::factory()->create(['event_id' => $event->id, 'status' => RegistrationStatus::CONFIRMED->value]);
        Registration::factory()->create(['event_id' => $event->id, 'status' => RegistrationStatus::CONFIRMED->value]);
        Registration::factory()->guest()->create(['event_id' => $event->id, 'status' => RegistrationStatus::CONFIRMED->value]);
        Registration::factory()->create(['event_id' => $event->id, 'status' => RegistrationStatus::CHECKED_IN->value]);
        Registration::factory()->create(['event_id' => $event->id, 'status' => RegistrationStatus::CANCELLED->value]);

        $this->actingAsApi($this->manager())
            ->getJson("/api/v1/reports/registrations?event_id={$event->id}")
            ->assertOk()
            ->assertJsonPath('data.rows.0.pending', 1)
            ->assertJsonPath('data.rows.0.confirmed', 3)
            ->assertJsonPath('data.rows.0.checked_in', 1)
            ->assertJsonPath('data.rows.0.cancelled', 1)
            ->assertJsonPath('data.rows.0.guest', 1)
            ->assertJsonPath('data.rows.0.account', 4)
            ->assertJsonPath('data.rows.0.total', 5);
    }

    public function test_revenue_report_sums_transactions_by_status(): void
    {
        $event = $this->event();
        $registration = Registration::factory()->create(['event_id' => $event->id]);

        Transaction::factory()->completed()->forRegistration($registration)->create(['amount' => 100]);
        Transaction::factory()->completed()->forRegistration($registration)->create(['amount' => 50]);
        Transaction::factory()->forRegistration($registration)->create(['amount' => 30]);
        Transaction::factory()->forRegistration($registration)->create(['amount' => 20, 'status' => 'failed']);
        Transaction::factory()->forRegistration($registration)->create(['amount' => 10, 'status' => 'refunded']);

        $this->actingAsApi($this->manager())
            ->getJson("/api/v1/reports/revenue?event_id={$event->id}")
            ->assertOk()
            ->assertJsonPath('data.rows.0.pending_amount', 30)
            ->assertJsonPath('data.rows.0.completed_amount', 150)
            ->assertJsonPath('data.rows.0.failed_amount', 20)
            ->assertJsonPath('data.rows.0.refunded_amount', 10)
            ->assertJsonPath('data.rows.0.net', 140)
            ->assertJsonPath('data.summary.completed_amount', 150);
    }

    public function test_events_report_rolls_up_all_metrics(): void
    {
        $event = $this->event();

        $attended = Registration::factory()->create(['event_id' => $event->id, 'status' => RegistrationStatus::CHECKED_IN->value]);
        Registration::factory()->create(['event_id' => $event->id, 'status' => RegistrationStatus::CONFIRMED->value]);
        Registration::factory()->create(['event_id' => $event->id, 'status' => RegistrationStatus::CANCELLED->value]);

        Attendance::factory()->forRegistration($attended)->create();
        Volunteer::factory()->create(['event_id' => $event->id]);
        Certificate::factory()->create(['registration_id' => $attended->id]);
        Transaction::factory()->completed()->forRegistration($attended)->create(['amount' => 75]);

        $this->actingAsApi($this->manager())
            ->getJson("/api/v1/reports/events?event_id={$event->id}")
            ->assertOk()
            ->assertJsonPath('data.rows.0.registered', 2)
            ->assertJsonPath('data.rows.0.confirmed', 1)
            ->assertJsonPath('data.rows.0.checked_in', 1)
            ->assertJsonPath('data.rows.0.cancelled', 1)
            ->assertJsonPath('data.rows.0.attendance', 1)
            ->assertJsonPath('data.rows.0.revenue', 75)
            ->assertJsonPath('data.rows.0.volunteers', 1)
            ->assertJsonPath('data.rows.0.certificates', 1);
    }

    public function test_volunteers_report_counts_statuses_and_hours(): void
    {
        $event = $this->event();

        Volunteer::factory()->create(['event_id' => $event->id, 'status' => VolunteerStatus::ASSIGNED->value]);
        Volunteer::factory()->accepted()->create(['event_id' => $event->id]);
        Volunteer::factory()->completed()->create(['event_id' => $event->id, 'hours_volunteered' => 6]);
        Volunteer::factory()->create(['event_id' => $event->id, 'status' => VolunteerStatus::CANCELLED->value]);

        $this->actingAsApi($this->manager())
            ->getJson("/api/v1/reports/volunteers?event_id={$event->id}")
            ->assertOk()
            ->assertJsonPath('data.rows.0.assigned', 1)
            ->assertJsonPath('data.rows.0.accepted', 1)
            ->assertJsonPath('data.rows.0.completed', 1)
            ->assertJsonPath('data.rows.0.cancelled', 1)
            ->assertJsonPath('data.rows.0.active', 3)
            ->assertJsonPath('data.rows.0.hours', 6);
    }

    public function test_certificates_report_counts_issued_emailed_and_revoked(): void
    {
        $event = $this->event();
        $registration = Registration::factory()->create(['event_id' => $event->id]);

        $issued = Certificate::factory()->create(['registration_id' => $registration->id, 'emailed_at' => now()]);
        $revoked = Certificate::factory()->create(['registration_id' => $registration->id, 'status' => CertificateStatus::REVOKED->value]);
        $revoked->delete();

        $this->actingAsApi($this->manager())
            ->getJson("/api/v1/reports/certificates?event_id={$event->id}")
            ->assertOk()
            ->assertJsonPath('data.rows.0.issued', 1)
            ->assertJsonPath('data.rows.0.emailed', 1)
            ->assertJsonPath('data.rows.0.revoked', 1)
            ->assertJsonPath('data.rows.0.total', 2);
    }

    public function test_reports_support_college_and_status_filters(): void
    {
        $collegeA = College::factory()->create();
        $collegeB = College::factory()->create();

        $this->event(['college_id' => $collegeA->id]);
        $this->event(['college_id' => $collegeA->id]);
        $this->event(['college_id' => $collegeB->id]);

        $this->actingAsApi($this->manager())
            ->getJson("/api/v1/reports/events?college_id={$collegeA->id}")
            ->assertOk()
            ->assertJsonCount(2, 'data.rows')
            ->assertJsonPath('data.summary.events', 2);

        $this->actingAsApi($this->manager())
            ->getJson('/api/v1/reports/events?status=published')
            ->assertOk()
            ->assertJsonPath('data.summary.events', 3);

        $this->actingAsApi($this->manager())
            ->getJson('/api/v1/reports/events?event_id=999999')
            ->assertUnprocessable();
    }

    public function test_csv_export_streams_utf8_bom_headers(): void
    {
        $event = $this->event();
        Registration::factory()->create(['event_id' => $event->id, 'status' => RegistrationStatus::CHECKED_IN->value]);

        $response = $this->actingAsApi($this->manager())
            ->get('/api/v1/reports/attendance/export?format=csv');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('attendance-report-', $response->headers->get('Content-Disposition'));

        $csv = $response->streamedContent();
        $this->assertStringStartsWith("\xEF\xBB\xBF", $csv);
        $this->assertStringContainsString('Event,Registered,Present', $csv);
    }

    public function test_pdf_export_returns_pdf(): void
    {
        $event = $this->event();
        Registration::factory()->create(['event_id' => $event->id]);

        $response = $this->actingAsApi($this->manager())
            ->get('/api/v1/reports/registrations/export?format=pdf');

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', $response->headers->get('Content-Type'));
        $this->assertStringStartsWith('%PDF', $response->streamedContent());
    }

    public function test_invalid_report_type_is_rejected(): void
    {
        $this->actingAsApi($this->manager())
            ->getJson('/api/v1/reports/bogus')
            ->assertStatus(422)
            ->assertJsonPath('code', 'invalid_report_type');
    }

    public function test_student_cannot_access_reports(): void
    {
        $this->actingAsApi($this->createUser())
            ->getJson('/api/v1/reports/attendance')
            ->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_access_reports(): void
    {
        $this->getJson('/api/v1/reports/attendance')
            ->assertUnauthorized();
    }
}
