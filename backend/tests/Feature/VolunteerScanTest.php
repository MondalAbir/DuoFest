<?php

namespace Tests\Feature;

use App\Contracts\Services\TicketServiceInterface;
use App\Enums\AttendanceStatus;
use App\Enums\RegistrationStatus;
use App\Enums\UserRole;
use App\Models\Attendance;
use App\Models\Event;
use App\Models\Registration;
use App\Models\Volunteer;
use Illuminate\Support\Facades\Crypt;
use Tests\TestCase;

class VolunteerScanTest extends TestCase
{
    private function ticketPayload(Registration $registration): string
    {
        return app(TicketServiceInterface::class)->encryptPayload($registration);
    }

    private function createAssignedVolunteer(Event $event)
    {
        $volunteer = $this->createUser([], UserRole::VOLUNTEER->value);
        Volunteer::factory()->create(['event_id' => $event->id, 'user_id' => $volunteer->id]);

        return $volunteer;
    }

    public function test_volunteer_sees_profile_with_stats(): void
    {
        $volunteer = $this->createUser([], UserRole::VOLUNTEER->value);
        $eventA = Event::factory()->create();
        $eventB = Event::factory()->create();
        Volunteer::factory()->create(['event_id' => $eventA->id, 'user_id' => $volunteer->id]);
        Volunteer::factory()->create(['event_id' => $eventB->id, 'user_id' => $volunteer->id]);

        $attended = Registration::factory()->create(['event_id' => $eventA->id, 'user_id' => $volunteer->id]);
        Attendance::factory()->create([
            'event_id' => $eventA->id,
            'registration_id' => $attended->id,
            'checked_in_by' => $volunteer->id,
        ]);

        $this->actingAsApi($volunteer)
            ->getJson('/api/v1/volunteer/profile')
            ->assertOk()
            ->assertJsonPath('data.user.id', $volunteer->id)
            ->assertJsonPath('data.assigned_events_count', 2)
            ->assertJsonPath('data.today_entries_count', 1);
    }

    public function test_volunteer_sees_only_active_assigned_events(): void
    {
        $volunteer = $this->createUser([], UserRole::VOLUNTEER->value);
        $active = Event::factory()->create();
        $completed = Event::factory()->create();
        Volunteer::factory()->create(['event_id' => $active->id, 'user_id' => $volunteer->id]);
        Volunteer::factory()->completed()->create(['event_id' => $completed->id, 'user_id' => $volunteer->id]);

        $this->actingAsApi($volunteer)
            ->getJson('/api/v1/volunteer/assigned-events')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.event_id', $active->id);
    }

    public function test_volunteer_sees_today_entries(): void
    {
        $volunteer = $this->createUser([], UserRole::VOLUNTEER->value);
        $event = Event::factory()->create();
        $registration = Registration::factory()->guest()->create([
            'event_id' => $event->id,
            'status' => RegistrationStatus::CHECKED_IN->value,
        ]);
        Attendance::factory()->create([
            'event_id' => $event->id,
            'registration_id' => $registration->id,
            'checked_in_by' => $volunteer->id,
        ]);

        $this->actingAsApi($volunteer)
            ->getJson('/api/v1/volunteer/today-entries')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.ticket_number', $registration->ticket_number)
            ->assertJsonPath('data.0.attendee.email', $registration->email);
    }

    public function test_validate_valid_ticket_returns_valid(): void
    {
        $event = Event::factory()->create();
        $volunteer = $this->createAssignedVolunteer($event);
        $registration = Registration::factory()->guest()->create([
            'event_id' => $event->id,
            'status' => RegistrationStatus::CONFIRMED->value,
        ]);

        $this->actingAsApi($volunteer)
            ->postJson("/api/v1/volunteer/scan/{$event->id}/validate", [
                'payload' => $this->ticketPayload($registration),
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'valid')
            ->assertJsonPath('data.registration.ticket_number', $registration->ticket_number);
    }

    public function test_validate_cancelled_ticket_returns_cancelled(): void
    {
        $event = Event::factory()->create();
        $volunteer = $this->createAssignedVolunteer($event);
        $registration = Registration::factory()->guest()->create([
            'event_id' => $event->id,
            'status' => RegistrationStatus::CANCELLED->value,
        ]);

        $this->actingAsApi($volunteer)
            ->postJson("/api/v1/volunteer/scan/{$event->id}/validate", [
                'payload' => $this->ticketPayload($registration),
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled_ticket');
    }

    public function test_validate_invalid_payload_returns_invalid(): void
    {
        $event = Event::factory()->create();
        $volunteer = $this->createAssignedVolunteer($event);

        $this->actingAsApi($volunteer)
            ->postJson("/api/v1/volunteer/scan/{$event->id}/validate", [
                'payload' => 'not-a-real-ticket',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'invalid_ticket');
    }

    public function test_validate_already_entered_ticket_returns_already_entered(): void
    {
        $event = Event::factory()->create();
        $volunteer = $this->createAssignedVolunteer($event);
        $registration = Registration::factory()->guest()->create([
            'event_id' => $event->id,
            'status' => RegistrationStatus::CONFIRMED->value,
        ]);
        Attendance::factory()->create([
            'event_id' => $event->id,
            'registration_id' => $registration->id,
            'checked_in_by' => $volunteer->id,
        ]);

        $this->actingAsApi($volunteer)
            ->postJson("/api/v1/volunteer/scan/{$event->id}/validate", [
                'payload' => $this->ticketPayload($registration),
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'already_entered');
    }

    public function test_validate_ticket_for_another_event_is_invalid(): void
    {
        $event = Event::factory()->create();
        $volunteer = $this->createAssignedVolunteer($event);
        $otherEvent = Event::factory()->create();
        $registration = Registration::factory()->guest()->create([
            'event_id' => $otherEvent->id,
            'status' => RegistrationStatus::CONFIRMED->value,
        ]);

        $this->actingAsApi($volunteer)
            ->postJson("/api/v1/volunteer/scan/{$event->id}/validate", [
                'payload' => $this->ticketPayload($registration),
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'invalid_ticket');
    }

    public function test_volunteer_not_assigned_to_event_is_forbidden(): void
    {
        $volunteer = $this->createUser([], UserRole::VOLUNTEER->value);
        $event = Event::factory()->create();

        $this->actingAsApi($volunteer)
            ->postJson("/api/v1/volunteer/scan/{$event->id}/validate", [
                'payload' => 'whatever',
            ])
            ->assertForbidden()
            ->assertJsonPath('code', 'not_assigned_to_event');
    }

    public function test_check_in_records_attendance_and_marks_registration(): void
    {
        $event = Event::factory()->create();
        $volunteer = $this->createAssignedVolunteer($event);
        $registration = Registration::factory()->guest()->create([
            'event_id' => $event->id,
            'email' => 'attendee@example.com',
            'status' => RegistrationStatus::CONFIRMED->value,
        ]);

        $this->actingAsApi($volunteer)
            ->postJson("/api/v1/volunteer/scan/{$event->id}/check-in", [
                'payload' => $this->ticketPayload($registration),
            ])
            ->assertCreated()
            ->assertJsonPath('data.ticket_number', $registration->ticket_number)
            ->assertJsonPath('data.status', AttendanceStatus::PRESENT->value);

        $this->assertDatabaseHas('attendance', [
            'event_id' => $event->id,
            'registration_id' => $registration->id,
            'checked_in_by' => $volunteer->id,
        ]);

        $this->assertSame(RegistrationStatus::CHECKED_IN, $registration->fresh()->status);
        $this->assertSame($volunteer->id, $registration->fresh()->checked_in_by);

        // Duplicate scan is rejected.
        $this->actingAsApi($volunteer)
            ->postJson("/api/v1/volunteer/scan/{$event->id}/check-in", [
                'payload' => $this->ticketPayload($registration),
            ])
            ->assertUnprocessable()
            ->assertJsonPath('code', 'already_entered');

        $this->assertSame(1, Attendance::query()->where('event_id', $event->id)->where('registration_id', $registration->id)->count());
    }

    public function test_check_in_rejects_cancelled_ticket(): void
    {
        $event = Event::factory()->create();
        $volunteer = $this->createAssignedVolunteer($event);
        $registration = Registration::factory()->guest()->create([
            'event_id' => $event->id,
            'status' => RegistrationStatus::CANCELLED->value,
        ]);

        $this->actingAsApi($volunteer)
            ->postJson("/api/v1/volunteer/scan/{$event->id}/check-in", [
                'payload' => $this->ticketPayload($registration),
            ])
            ->assertUnprocessable()
            ->assertJsonPath('code', 'cancelled_ticket');

        $this->assertDatabaseMissing('attendance', ['registration_id' => $registration->id]);
    }

    public function test_check_in_rejects_invalid_ticket(): void
    {
        $event = Event::factory()->create();
        $volunteer = $this->createAssignedVolunteer($event);

        $this->actingAsApi($volunteer)
            ->postJson("/api/v1/volunteer/scan/{$event->id}/check-in", [
                'payload' => Crypt::encryptString(json_encode(['garbage' => true])),
            ])
            ->assertUnprocessable()
            ->assertJsonPath('code', 'invalid_ticket');
    }

    public function test_guest_ticket_check_in_stores_attendance_without_user(): void
    {
        $event = Event::factory()->create();
        $volunteer = $this->createAssignedVolunteer($event);
        $registration = Registration::factory()->guest()->create([
            'event_id' => $event->id,
            'user_id' => null,
            'status' => RegistrationStatus::CONFIRMED->value,
        ]);

        $this->actingAsApi($volunteer)
            ->postJson("/api/v1/volunteer/scan/{$event->id}/check-in", [
                'payload' => $this->ticketPayload($registration),
            ])
            ->assertCreated();

        $attendance = Attendance::query()->where('registration_id', $registration->id)->firstOrFail();
        $this->assertNull($attendance->user_id);
        $this->assertSame($registration->id, $attendance->registration_id);
    }

    public function test_student_without_scan_permission_cannot_use_volunteer_api(): void
    {
        $student = $this->createUser();

        $this->actingAsApi($student)
            ->getJson('/api/v1/volunteer/profile')
            ->assertForbidden();
    }
}
