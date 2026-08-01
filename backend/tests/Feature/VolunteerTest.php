<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Event;
use App\Models\Volunteer;
use Tests\TestCase;

class VolunteerTest extends TestCase
{
    public function test_event_manager_can_add_volunteer(): void
    {
        $manager = $this->createUser([], UserRole::EVENT_MANAGER->value);
        $volunteer = $this->createUser([], UserRole::VOLUNTEER->value);
        $event = Event::factory()->create();

        $this->actingAsApi($manager)->postJson("/api/v1/events/{$event->id}/volunteers", [
            'user_id' => $volunteer->id,
            'role' => 'Morning Check-in',
            'shift_start_at' => now()->addWeek()->setTime(8, 0)->toISOString(),
            'shift_end_at' => now()->addWeek()->setTime(12, 0)->toISOString(),
        ])->assertCreated()
            ->assertJsonPath('data.role', 'Morning Check-in')
            ->assertJsonPath('data.user_id', $volunteer->id);
    }

    public function test_manager_can_bulk_assign_volunteers(): void
    {
        $manager = $this->createUser([], UserRole::EVENT_MANAGER->value);
        $volunteer = $this->createUser([], UserRole::VOLUNTEER->value);
        $event = Event::factory()->create();

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/volunteers/assign", [
                'user_ids' => [$volunteer->id],
            ])->assertOk()
            ->assertJsonPath('data.assigned.0', $volunteer->id);

        $this->assertDatabaseHas('volunteers', [
            'event_id' => $event->id,
            'user_id' => $volunteer->id,
        ]);
    }

    public function test_volunteer_sees_their_assignments(): void
    {
        $volunteer = $this->createUser([], UserRole::VOLUNTEER->value);
        $event = Event::factory()->create();
        Volunteer::factory()->create(['event_id' => $event->id, 'user_id' => $volunteer->id]);

        $this->actingAsApi($volunteer)
            ->getJson('/api/v1/volunteer/my-volunteering')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.user_id', $volunteer->id);
    }

    public function test_manager_can_remove_volunteer(): void
    {
        $manager = $this->createUser([], UserRole::EVENT_MANAGER->value);
        $volunteerUser = $this->createUser([], UserRole::VOLUNTEER->value);
        $event = Event::factory()->create();
        $volunteer = Volunteer::factory()->create(['event_id' => $event->id, 'user_id' => $volunteerUser->id]);

        $this->actingAsApi($manager)
            ->deleteJson("/api/v1/volunteers/{$volunteer->id}")
            ->assertOk();

        $this->assertDatabaseMissing('volunteers', [
            'id' => $volunteer->id,
        ]);
    }

    public function test_duplicate_volunteer_assignment_is_rejected(): void
    {
        $manager = $this->createUser([], UserRole::EVENT_MANAGER->value);
        $volunteer = $this->createUser([], UserRole::VOLUNTEER->value);
        $event = Event::factory()->create();
        Volunteer::factory()->create(['event_id' => $event->id, 'user_id' => $volunteer->id]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/volunteers", [
                'user_id' => $volunteer->id,
            ])->assertStatus(422);
    }

    public function test_manager_can_list_event_volunteers(): void
    {
        $manager = $this->createUser([], UserRole::EVENT_MANAGER->value);
        $volunteer = $this->createUser([], UserRole::VOLUNTEER->value);
        $event = Event::factory()->create();
        Volunteer::factory()->create(['event_id' => $event->id, 'user_id' => $volunteer->id]);

        $this->actingAsApi($manager)
            ->getJson("/api/v1/events/{$event->id}/volunteers")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.user_id', $volunteer->id);
    }
}
