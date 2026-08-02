<?php

namespace Tests\Feature;

use App\Enums\ActivityType;
use App\Enums\EventMediaType;
use App\Enums\EventStatus;
use App\Enums\RegistrationStatus;
use App\Enums\UserRole;
use App\Models\Attendance;
use App\Models\Certificate;
use App\Models\College;
use App\Models\Event;
use App\Models\EventMedia;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EventManagementTest extends TestCase
{
    private function manager(): User
    {
        return $this->createUser([], UserRole::EVENT_MANAGER->value);
    }

    private function publishedEvent(array $attributes = []): Event
    {
        return Event::factory()->published()->create($attributes);
    }

    public function test_manager_can_create_event_with_registration_settings(): void
    {
        $manager = $this->manager();
        $college = College::factory()->create();

        $this->actingAsApi($manager)->postJson('/api/v1/events', [
            'college_id' => $college->id,
            'title' => 'Tech Summit 2026',
            'starts_at' => now()->addWeek()->toISOString(),
            'ends_at' => now()->addWeek()->addHours(6)->toISOString(),
            'requires_approval' => false,
            'registration_enabled' => true,
            'registration_open_at' => now()->addDay()->toISOString(),
            'registration_closes_at' => now()->addWeek()->subDay()->toISOString(),
        ])->assertCreated()
            ->assertJsonPath('data.title', 'Tech Summit 2026')
            ->assertJsonPath('data.phase', 'draft')
            ->assertJsonPath('data.registration_enabled', true)
            ->assertJsonPath('data.registration_open_at', fn ($value) => $value !== null)
            ->assertJsonPath('data.registration_closes_at', fn ($value) => $value !== null);
    }

    public function test_registration_window_must_be_chronological(): void
    {
        $manager = $this->manager();
        $college = College::factory()->create();

        $this->actingAsApi($manager)->postJson('/api/v1/events', [
            'college_id' => $college->id,
            'title' => 'Bad Window',
            'starts_at' => now()->addWeek()->toISOString(),
            'ends_at' => now()->addWeek()->addHours(6)->toISOString(),
            'registration_open_at' => now()->addWeek()->toISOString(),
            'registration_closes_at' => now()->addDay()->toISOString(),
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('registration_closes_at');
    }

    public function test_organizer_can_update_their_own_event(): void
    {
        $student = $this->createUser();
        $event = Event::factory()->create(['organizer_id' => $student->id]);

        $this->actingAsApi($student)
            ->putJson("/api/v1/events/{$event->id}", [
                'title' => 'Renamed by Organizer',
            ])->assertOk()
            ->assertJsonPath('data.title', 'Renamed by Organizer');
    }

    public function test_student_cannot_update_or_publish_event(): void
    {
        $student = $this->createUser();
        $event = $this->publishedEvent();

        $this->actingAsApi($student)
            ->putJson("/api/v1/events/{$event->id}", ['title' => 'Nope'])
            ->assertForbidden();

        $this->actingAsApi($student)
            ->postJson("/api/v1/events/{$event->id}/publish")
            ->assertForbidden();
    }

    public function test_manager_can_archive_and_unarchive_event(): void
    {
        $manager = $this->manager();
        $event = $this->publishedEvent();

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/archive")
            ->assertOk()
            ->assertJsonPath('data.status', EventStatus::ARCHIVED->value)
            ->assertJsonPath('data.archived_from', EventStatus::PUBLISHED->value);

        $this->assertDatabaseHas('activity_logs', [
            'subject_id' => $event->id,
            'causer_id' => $manager->id,
            'type' => ActivityType::ARCHIVED->value,
        ]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/unarchive")
            ->assertOk()
            ->assertJsonPath('data.status', EventStatus::PUBLISHED->value)
            ->assertJsonPath('data.archived_from', null);
    }

    public function test_archived_events_are_hidden_from_public_list(): void
    {
        $manager = $this->manager();
        $event = $this->publishedEvent();

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/archive")
            ->assertOk();

        $this->app['auth']->forgetGuards();

        $this->getJson('/api/v1/events')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_events_can_be_filtered_by_phase(): void
    {
        $this->travelTo(now()->startOfDay());

        $upcoming = $this->publishedEvent([
            'starts_at' => now()->addDays(3),
            'ends_at' => now()->addDays(3)->addHours(5),
        ]);
        $ongoing = $this->publishedEvent([
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addHour(),
        ]);
        $completed = $this->publishedEvent([
            'starts_at' => now()->subDays(2),
            'ends_at' => now()->subDay(),
        ]);

        $this->getJson('/api/v1/events?phase=upcoming')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $upcoming->id);

        $this->getJson('/api/v1/events?phase=ongoing')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $ongoing->id);

        $this->getJson('/api/v1/events?phase=completed')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $completed->id);

        $this->getJson('/api/v1/events?upcoming=true')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_manager_can_upload_and_replace_event_banner(): void
    {
        Storage::fake('public');
        $manager = $this->manager();
        $event = $this->publishedEvent();

        $this->actingAsApi($manager)->post('/api/v1/events/'.$event->id.'/media', [
            'type' => EventMediaType::BANNER->value,
            'image' => UploadedFile::fake()->image('banner.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.type', EventMediaType::BANNER->value);

        $first = EventMedia::query()->where('event_id', $event->id)->where('type', EventMediaType::BANNER->value)->first();
        $this->assertNotNull($first);
        Storage::disk('public')->assertExists($first->file_path);

        $this->actingAsApi($manager)->post('/api/v1/events/'.$event->id.'/media', [
            'type' => EventMediaType::BANNER->value,
            'image' => UploadedFile::fake()->image('banner-2.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertCreated();

        $this->assertSame(1, EventMedia::query()->where('event_id', $event->id)->where('type', EventMediaType::BANNER->value)->count());
        Storage::disk('public')->assertMissing($first->file_path);
    }

    public function test_manager_can_manage_gallery_and_delete_media(): void
    {
        Storage::fake('public');
        $manager = $this->manager();
        $event = $this->publishedEvent();

        $this->actingAsApi($manager)->post('/api/v1/events/'.$event->id.'/media', [
            'type' => EventMediaType::GALLERY->value,
            'image' => UploadedFile::fake()->image('pic-1.jpg'),
            'alt_text' => 'Stage setup',
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.alt_text', 'Stage setup');

        $gallery = EventMedia::query()->where('event_id', $event->id)->where('type', EventMediaType::GALLERY->value)->first();

        $this->actingAsApi($manager)
            ->getJson("/api/v1/events/{$event->id}/media")
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->actingAsApi($manager)
            ->deleteJson("/api/v1/events/{$event->id}/media/{$gallery->id}")
            ->assertOk();

        $this->assertDatabaseMissing('event_media', ['id' => $gallery->id]);
        Storage::disk('public')->assertMissing($gallery->file_path);
    }

    public function test_manager_can_manage_sponsors(): void
    {
        $manager = $this->manager();
        $event = $this->publishedEvent();

        $sponsor = $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/sponsors", [
                'name' => 'Acme Corp',
                'tier' => 'gold',
                'website_url' => 'https://acme.example.com',
            ])->assertCreated()
            ->assertJsonPath('data.name', 'Acme Corp')
            ->json('data');

        $this->actingAsApi($manager)
            ->putJson("/api/v1/events/{$event->id}/sponsors/{$sponsor['id']}", [
                'tier' => 'platinum',
            ])->assertOk()
            ->assertJsonPath('data.tier', 'platinum');

        $this->actingAsApi($manager)
            ->getJson("/api/v1/events/{$event->id}/sponsors?tier=platinum")
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->actingAsApi($manager)
            ->deleteJson("/api/v1/events/{$event->id}/sponsors/{$sponsor['id']}")
            ->assertOk();

        $this->assertDatabaseMissing('event_sponsors', ['id' => $sponsor['id']]);
    }

    public function test_sponsor_tier_is_validated(): void
    {
        $manager = $this->manager();
        $event = $this->publishedEvent();

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/sponsors", [
                'name' => 'Bad Tier',
                'tier' => 'diamond',
            ])->assertUnprocessable()
            ->assertJsonValidationErrors('tier');
    }

    public function test_certificates_are_issued_only_to_attendees_with_attendance(): void
    {
        Storage::fake('public');

        $manager = $this->manager();
        $event = $this->publishedEvent();
        $attendee = $this->createUser(['email' => 'attendee@example.com']);
        $noShow = $this->createUser(['email' => 'noshow@example.com']);
        $confirmedOnly = $this->createUser(['email' => 'confirmed@example.com']);

        $attended = Registration::factory()->create([
            'event_id' => $event->id,
            'user_id' => $attendee->id,
            'status' => RegistrationStatus::CHECKED_IN->value,
            'checked_in_at' => now(),
        ]);
        Attendance::factory()->forRegistration($attended)->create();

        Registration::factory()->create([
            'event_id' => $event->id,
            'user_id' => $noShow->id,
            'status' => RegistrationStatus::CHECKED_IN->value,
            'checked_in_at' => now(),
        ]);

        Registration::factory()->create([
            'event_id' => $event->id,
            'user_id' => $confirmedOnly->id,
            'status' => RegistrationStatus::CONFIRMED->value,
        ]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates")
            ->assertCreated()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.user_id', $attendee->id);

        $this->assertSame(1, Certificate::query()->where('registration_id', $attended->id)->count());

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates")
            ->assertCreated()
            ->assertJsonCount(0, 'data');
    }

    public function test_certificates_can_be_listed_and_revoked(): void
    {
        Storage::fake('public');

        $manager = $this->manager();
        $event = $this->publishedEvent();
        $attendee = $this->createUser();

        $registration = Registration::factory()->create([
            'event_id' => $event->id,
            'user_id' => $attendee->id,
            'status' => RegistrationStatus::CHECKED_IN->value,
            'checked_in_at' => now(),
        ]);
        Attendance::factory()->forRegistration($registration)->create();

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates", [
                'registration_ids' => [$registration->id],
            ])->assertCreated()
            ->assertJsonCount(1, 'data');

        $certificate = Certificate::query()->first();

        $this->actingAsApi($manager)
            ->getJson("/api/v1/events/{$event->id}/certificates")
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->actingAsApi($manager)
            ->deleteJson("/api/v1/events/{$event->id}/certificates/{$certificate->id}")
            ->assertOk();

        $this->assertSoftDeleted('certificates', ['id' => $certificate->id]);
    }

    public function test_registration_settings_are_enforced(): void
    {
        $student = $this->createUser();

        $disabled = $this->publishedEvent(['registration_enabled' => false]);
        $notOpen = $this->publishedEvent(['registration_open_at' => now()->addDay()]);
        $closed = $this->publishedEvent(['registration_closes_at' => now()->subDay()]);

        $this->actingAsApi($student)
            ->postJson("/api/v1/events/{$disabled->id}/register")
            ->assertUnprocessable()
            ->assertJsonPath('code', 'registrations_closed');

        $this->actingAsApi($student)
            ->postJson("/api/v1/events/{$notOpen->id}/register")
            ->assertUnprocessable()
            ->assertJsonPath('code', 'registrations_not_open');

        $this->actingAsApi($student)
            ->postJson("/api/v1/events/{$closed->id}/register")
            ->assertUnprocessable()
            ->assertJsonPath('code', 'registrations_closed');
    }

    public function test_student_cannot_manage_media_sponsors_or_certificates(): void
    {
        $student = $this->createUser();
        $event = $this->publishedEvent();

        $this->actingAsApi($student)
            ->post("/api/v1/events/{$event->id}/media", [
                'type' => EventMediaType::BANNER->value,
                'image' => UploadedFile::fake()->image('x.jpg'),
            ], ['Accept' => 'application/json'])
            ->assertForbidden();

        $this->actingAsApi($student)
            ->postJson("/api/v1/events/{$event->id}/sponsors", ['name' => 'Nope'])
            ->assertForbidden();

        $this->actingAsApi($student)
            ->postJson("/api/v1/events/{$event->id}/certificates")
            ->assertForbidden();
    }
}
