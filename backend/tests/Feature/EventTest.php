<?php

namespace Tests\Feature;

use App\Enums\EventStatus;
use App\Enums\UserRole;
use App\Models\College;
use App\Models\Event;
use Tests\TestCase;

class EventTest extends TestCase
{
    public function test_anyone_can_list_published_events(): void
    {
        $college = College::factory()->create();

        Event::factory()->count(2)->published()->create(['college_id' => $college->id]);
        Event::factory()->create(['college_id' => $college->id, 'status' => EventStatus::DRAFT->value]);

        $this->getJson('/api/v1/events')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data' => [['id', 'title', 'slug', 'status']]]);
    }

    public function test_events_can_be_filtered_by_college(): void
    {
        $collegeA = College::factory()->create();
        $collegeB = College::factory()->create();

        Event::factory()->create(['college_id' => $collegeA->id]);
        Event::factory()->create(['college_id' => $collegeB->id]);

        $this->getJson("/api/v1/events?college_id={$collegeA->id}")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_create_event(): void
    {
        $admin = $this->createUser([], UserRole::EVENT_MANAGER->value);
        $college = College::factory()->create();

        $this->actingAsApi($admin)->postJson('/api/v1/events', [
            'college_id' => $college->id,
            'title' => 'Spring Fest 2026',
            'starts_at' => now()->addWeek()->toISOString(),
            'ends_at' => now()->addWeek()->addHours(6)->toISOString(),
            'capacity' => 200,
        ])->assertCreated()
            ->assertJsonPath('data.title', 'Spring Fest 2026')
            ->assertJsonPath('data.status', EventStatus::DRAFT->value);

        $this->assertDatabaseHas('events', ['slug' => 'spring-fest-2026']);
    }

    public function test_student_cannot_create_event(): void
    {
        $student = $this->createUser();
        $college = College::factory()->create();

        $this->actingAsApi($student)->postJson('/api/v1/events', [
            'college_id' => $college->id,
            'title' => 'Nope',
            'starts_at' => now()->addWeek()->toISOString(),
            'ends_at' => now()->addWeek()->addHours(6)->toISOString(),
        ])->assertForbidden();
    }

    public function test_manager_can_publish_and_unpublish_event(): void
    {
        $manager = $this->createUser([], UserRole::EVENT_MANAGER->value);
        $event = Event::factory()->create();

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/publish")
            ->assertOk()
            ->assertJsonPath('data.status', EventStatus::PUBLISHED->value);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/unpublish")
            ->assertOk()
            ->assertJsonPath('data.status', EventStatus::DRAFT->value);
    }

    public function test_event_can_be_found_by_slug(): void
    {
        $event = Event::factory()->create(['title' => 'Special Slug Event']);

        $this->getJson("/api/v1/events/slug/{$event->slug}")
            ->assertOk()
            ->assertJsonPath('data.id', $event->id);
    }

    public function test_admin_can_delete_event(): void
    {
        $admin = $this->createUser([], UserRole::SUPER_ADMIN->value);
        $event = Event::factory()->create();

        $this->actingAsApi($admin)
            ->deleteJson("/api/v1/events/{$event->id}")
            ->assertOk();

        $this->assertSoftDeleted('events', ['id' => $event->id]);
    }

    public function test_event_validation_requires_valid_dates(): void
    {
        $manager = $this->createUser([], UserRole::EVENT_MANAGER->value);
        $college = College::factory()->create();

        $this->actingAsApi($manager)->postJson('/api/v1/events', [
            'college_id' => $college->id,
            'title' => 'Bad Dates',
            'starts_at' => now()->subDay()->toISOString(),
            'ends_at' => now()->subDay()->addHours(2)->toISOString(),
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('starts_at');
    }
}
