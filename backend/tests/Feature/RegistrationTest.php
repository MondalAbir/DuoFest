<?php

namespace Tests\Feature;

use App\Enums\EventStatus;
use App\Enums\RegistrationStatus;
use App\Enums\UserRole;
use App\Models\Event;
use App\Models\Registration;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    public function test_student_can_register_for_published_event(): void
    {
        $student = $this->createUser();
        $event = Event::factory()->published()->create(['requires_approval' => false]);

        $this->actingAsApi($student)
            ->postJson("/api/v1/events/{$event->id}/register")
            ->assertCreated()
            ->assertJsonPath('data.status', RegistrationStatus::CONFIRMED->value)
            ->assertJsonPath('data.ticket_number', fn ($ticket) => str_starts_with($ticket, 'DF-'));

        $this->assertDatabaseHas('registrations', ['event_id' => $event->id, 'user_id' => $student->id]);
    }

    public function test_requires_approval_event_starts_as_pending(): void
    {
        $student = $this->createUser();
        $event = Event::factory()->published()->create(['requires_approval' => true]);

        $this->actingAsApi($student)
            ->postJson("/api/v1/events/{$event->id}/register")
            ->assertCreated()
            ->assertJsonPath('data.status', RegistrationStatus::PENDING->value);
    }

    public function test_duplicate_registration_is_rejected(): void
    {
        $student = $this->createUser();
        $event = Event::factory()->published()->create();
        Registration::factory()->create(['event_id' => $event->id, 'user_id' => $student->id]);

        $this->actingAsApi($student)
            ->postJson("/api/v1/events/{$event->id}/register")
            ->assertUnprocessable()
            ->assertJsonPath('code', 'already_registered');
    }

    public function test_cannot_register_for_draft_event(): void
    {
        $student = $this->createUser();
        $event = Event::factory()->create(['status' => EventStatus::DRAFT->value]);

        $this->actingAsApi($student)
            ->postJson("/api/v1/events/{$event->id}/register")
            ->assertUnprocessable()
            ->assertJsonPath('code', 'event_not_open');
    }

    public function test_full_event_cannot_accept_more_registrations(): void
    {
        $student = $this->createUser();
        $event = Event::factory()->published()->create(['capacity' => 1]);
        Registration::factory()->create(['event_id' => $event->id, 'status' => RegistrationStatus::CONFIRMED->value]);

        $this->actingAsApi($student)
            ->postJson("/api/v1/events/{$event->id}/register")
            ->assertUnprocessable()
            ->assertJsonPath('code', 'event_full');
    }

    public function test_registration_count_increments_and_decrements(): void
    {
        $student = $this->createUser();
        $event = Event::factory()->published()->create(['requires_approval' => false]);

        $this->actingAsApi($student)->postJson("/api/v1/events/{$event->id}/register");
        $this->assertDatabaseHas('events', ['id' => $event->id, 'registration_count' => 1]);

        $registration = Registration::query()->where('event_id', $event->id)->firstOrFail();

        $this->actingAsApi($student)->postJson("/api/v1/registrations/{$registration->id}/cancel");
        $this->assertDatabaseHas('events', ['id' => $event->id, 'registration_count' => 0]);
    }

    public function test_student_sees_only_own_registrations(): void
    {
        $studentA = $this->createUser();
        $studentB = $this->createUser();
        $event = Event::factory()->published()->create();

        Registration::factory()->create(['event_id' => $event->id, 'user_id' => $studentA->id]);
        Registration::factory()->create(['event_id' => $event->id, 'user_id' => $studentB->id]);

        $this->actingAsApi($studentA)
            ->getJson('/api/v1/registrations')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.user_id', $studentA->id);
    }

    public function test_manager_can_check_in_registration(): void
    {
        $manager = $this->createUser([], UserRole::EVENT_MANAGER->value);
        $student = $this->createUser();
        $event = Event::factory()->published()->create(['requires_approval' => false]);
        $registration = Registration::factory()->create([
            'event_id' => $event->id,
            'user_id' => $student->id,
            'status' => RegistrationStatus::CONFIRMED->value,
        ]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/registrations/{$registration->id}/check-in")
            ->assertOk()
            ->assertJsonPath('data.status', RegistrationStatus::CHECKED_IN->value)
            ->assertJsonPath('data.checked_in_by', $manager->id);

        $this->assertNotNull($registration->fresh()->checked_in_at);
    }

    public function test_check_in_rejects_cancelled_registration(): void
    {
        $manager = $this->createUser([], UserRole::EVENT_MANAGER->value);
        $student = $this->createUser();
        $event = Event::factory()->published()->create();
        $registration = Registration::factory()->create([
            'event_id' => $event->id,
            'user_id' => $student->id,
            'status' => RegistrationStatus::CANCELLED->value,
        ]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/registrations/{$registration->id}/check-in")
            ->assertUnprocessable()
            ->assertJsonPath('code', 'cancelled');
    }

    public function test_student_cannot_check_in_other_people(): void
    {
        $student = $this->createUser();
        $other = $this->createUser();
        $event = Event::factory()->published()->create();
        $registration = Registration::factory()->create([
            'event_id' => $event->id,
            'user_id' => $other->id,
            'status' => RegistrationStatus::CONFIRMED->value,
        ]);

        $this->actingAsApi($student)
            ->postJson("/api/v1/registrations/{$registration->id}/check-in")
            ->assertForbidden();
    }

    public function test_user_can_cancel_own_registration(): void
    {
        $student = $this->createUser();
        $event = Event::factory()->published()->create();
        $registration = Registration::factory()->create(['event_id' => $event->id, 'user_id' => $student->id]);

        $this->actingAsApi($student)
            ->postJson("/api/v1/registrations/{$registration->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', RegistrationStatus::CANCELLED->value);
    }
}
