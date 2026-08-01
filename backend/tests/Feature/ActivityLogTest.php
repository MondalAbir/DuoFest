<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\College;
use App\Models\Event;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    public function test_model_activity_is_logged_on_create(): void
    {
        $admin = $this->createUser([], UserRole::SUPER_ADMIN->value);

        $this->actingAsApi($admin)->postJson('/api/v1/colleges', [
            'name' => 'Logged College',
            'code' => 'LG1',
        ])->assertCreated();

        $this->assertDatabaseHas('activity_logs', [
            'type' => 'created',
            'subject_type' => College::class,
            'causer_id' => $admin->id,
        ]);
    }

    public function test_admin_can_list_activity_logs(): void
    {
        $admin = $this->createUser([], UserRole::SUPER_ADMIN->value);
        $event = Event::factory()->create();
        ActivityLog::query()->create([
            'type' => 'created',
            'description' => 'created Event',
            'subject_type' => $event->getMorphClass(),
            'subject_id' => $event->id,
            'causer_id' => $admin->id,
        ]);

        $this->actingAsApi($admin)
            ->getJson('/api/v1/activity-logs')
            ->assertOk()
            ->assertJsonStructure(['data' => [['id', 'type', 'description']]]);
    }

    public function test_student_cannot_list_activity_logs(): void
    {
        $student = $this->createUser();

        $this->actingAsApi($student)
            ->getJson('/api/v1/activity-logs')
            ->assertForbidden();
    }

    public function test_activity_logs_can_be_filtered_by_type(): void
    {
        $admin = $this->createUser([], UserRole::SUPER_ADMIN->value);
        $event = Event::factory()->create();
        ActivityLog::query()->create([
            'type' => 'created',
            'description' => 'created Event',
            'subject_type' => $event->getMorphClass(),
            'subject_id' => $event->id,
            'causer_id' => $admin->id,
        ]);

        $this->actingAsApi($admin)
            ->getJson('/api/v1/activity-logs?type=updated')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }
}
