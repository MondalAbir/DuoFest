<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Event;
use App\Models\User;
use App\Models\VolunteerSlot;
use Tests\TestCase;

class VolunteerTest extends TestCase
{
    public function test_event_manager_can_create_volunteer_slot(): void
    {
        $manager = $this->createUser([], UserRole::EVENT_MANAGER->value);
        $event = Event::factory()->create();

        $this->actingAsApi($manager)->postJson("/api/v1/events/{$event->id}/slots", [
            'name' => 'Morning Check-in',
            'starts_at' => now()->addWeek()->setTime(8, 0)->toISOString(),
            'ends_at' => now()->addWeek()->setTime(12, 0)->toISOString(),
            'capacity' => 5,
        ])->assertCreated()
            ->assertJsonPath('data.name', 'Morning Check-in');
    }

    public function test_manager_can_assign_volunteers_to_slot(): void
    {
        $manager = $this->createUser([], UserRole::EVENT_MANAGER->value);
        $volunteer = $this->createUser([], UserRole::VOLUNTEER->value);
        $event = Event::factory()->create();
        $slot = VolunteerSlot::factory()->create(['event_id' => $event->id]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/slots/{$slot->id}/assign", [
                'user_ids' => [$volunteer->id],
            ])->assertOk()
            ->assertJsonPath('data.assigned.0', $volunteer->id);

        $this->assertDatabaseHas('volunteer_slot_user', [
            'volunteer_slot_id' => $slot->id,
            'user_id' => $volunteer->id,
        ]);
    }

    public function test_volunteer_sees_their_slots(): void
    {
        $volunteer = $this->createUser([], UserRole::VOLUNTEER->value);
        $event = Event::factory()->create();
        $slot = VolunteerSlot::factory()->create(['event_id' => $event->id]);
        $slot->volunteers()->attach($volunteer->id, ['status' => 'assigned']);

        $this->actingAsApi($volunteer)
            ->getJson('/api/v1/volunteer/my-slots')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $slot->id);
    }

    public function test_manager_can_remove_volunteer(): void
    {
        $manager = $this->createUser([], UserRole::EVENT_MANAGER->value);
        $volunteer = $this->createUser([], UserRole::VOLUNTEER->value);
        $event = Event::factory()->create();
        $slot = VolunteerSlot::factory()->create(['event_id' => $event->id]);
        $slot->volunteers()->attach($volunteer->id, ['status' => 'assigned']);

        $this->actingAsApi($manager)
            ->deleteJson("/api/v1/events/{$event->id}/slots/{$slot->id}/volunteers/{$volunteer->id}")
            ->assertOk();

        $this->assertDatabaseMissing('volunteer_slot_user', [
            'volunteer_slot_id' => $slot->id,
            'user_id' => $volunteer->id,
        ]);
    }
}
