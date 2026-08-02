<?php

namespace Database\Seeders;

use App\Enums\EventStatus;
use App\Enums\UserRole;
use App\Enums\VolunteerStatus;
use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Certificate;
use App\Models\College;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\Registration;
use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $college = College::query()->firstOrCreate(
            ['code' => 'DUOFEST'],
            [
                'name' => 'DuoFest University',
                'description' => 'Host institution of DuoFest.',
                'city' => 'New Delhi',
                'country' => 'India',
            ],
        );

        $admin = $this->demoUser('superadmin@duofest.test', 'DuoFest Admin', $college, UserRole::SUPER_ADMIN->value);
        $organizer = $this->demoUser('organizer@duofest.test', 'Event Organizer', $college, UserRole::EVENT_MANAGER->value);
        $volunteer = $this->demoUser('volunteer@duofest.test', 'Event Volunteer', $college, UserRole::VOLUNTEER->value);
        $student = $this->demoUser('student@duofest.test', 'Student Attendee', $college, UserRole::STUDENT->value);

        $cultural = EventCategory::query()->where('slug', 'cultural')->first();
        $technical = EventCategory::query()->where('slug', 'technical')->first();

        $culturalNight = Event::query()->firstOrCreate(
            ['slug' => 'duofest-cultural-night-2026'],
            [
                'college_id' => $college->id,
                'organizer_id' => $organizer->id,
                'event_category_id' => $cultural?->id,
                'title' => 'DuoFest Cultural Night 2026',
                'description' => 'An evening of music, dance and drama celebrating college talent.',
                'venue' => 'Main Auditorium',
                'starts_at' => now()->addDays(14)->setTime(18, 0),
                'ends_at' => now()->addDays(14)->setTime(23, 0),
                'status' => EventStatus::PUBLISHED->value,
                'capacity' => 500,
                'requires_approval' => false,
                'is_featured' => true,
            ],
        );

        $hackathon = Event::query()->firstOrCreate(
            ['slug' => 'tech-hackathon-2026'],
            [
                'college_id' => $college->id,
                'organizer_id' => $organizer->id,
                'event_category_id' => $technical?->id,
                'title' => 'Tech Hackathon 2026',
                'description' => '48-hour hackathon for developers and designers.',
                'venue' => 'Innovation Lab',
                'starts_at' => now()->addMonth()->setTime(9, 0),
                'ends_at' => now()->addMonth()->addDays(2)->setTime(9, 0),
                'status' => EventStatus::UPCOMING->value,
                'capacity' => 200,
                'requires_approval' => true,
                'is_featured' => false,
            ],
        );

        Volunteer::query()->firstOrCreate(
            ['event_id' => $culturalNight->id, 'user_id' => $student->id],
            [
                'assigned_by' => $organizer->id,
                'role' => 'Usher',
                'shift_start_at' => $culturalNight->starts_at,
                'shift_end_at' => $culturalNight->ends_at,
                'status' => VolunteerStatus::ACCEPTED->value,
            ],
        );

        Volunteer::query()->firstOrCreate(
            ['event_id' => $culturalNight->id, 'user_id' => $organizer->id],
            [
                'assigned_by' => $admin->id,
                'role' => 'Stage Manager',
                'shift_start_at' => $culturalNight->starts_at,
                'shift_end_at' => $culturalNight->ends_at,
                'status' => VolunteerStatus::ASSIGNED->value,
            ],
        );

        Volunteer::query()->firstOrCreate(
            ['event_id' => $culturalNight->id, 'user_id' => $volunteer->id],
            [
                'assigned_by' => $organizer->id,
                'role' => 'Ticket Scanner',
                'shift_start_at' => $culturalNight->starts_at,
                'shift_end_at' => $culturalNight->ends_at,
                'status' => VolunteerStatus::ACCEPTED->value,
            ],
        );

        $registration = Registration::query()->firstOrCreate(
            ['event_id' => $culturalNight->id, 'user_id' => $student->id],
            [
                'ticket_number' => 'DF-DEMO-'.strtoupper(Str::random(6)),
                'status' => 'confirmed',
                'checked_in_at' => $culturalNight->starts_at,
                'checked_in_by' => $organizer->id,
            ],
        );

        Attendance::query()->firstOrCreate(
            ['event_id' => $culturalNight->id, 'user_id' => $student->id],
            [
                'registration_id' => $registration->id,
                'checked_in_by' => $organizer->id,
                'attended_at' => $culturalNight->starts_at,
                'status' => 'present',
            ],
        );

        Certificate::query()->firstOrCreate(
            ['certificate_number' => 'CERT-DEMO-001'],
            [
                'registration_id' => $registration->id,
                'user_id' => $student->id,
                'template' => 'participation',
                'status' => 'issued',
                'issued_at' => $culturalNight->ends_at,
            ],
        );

        Announcement::query()->firstOrCreate(
            ['title' => 'Cultural Night gate times', 'event_id' => $culturalNight->id],
            [
                'college_id' => $college->id,
                'created_by' => $admin->id,
                'body' => 'Doors open 30 minutes before the show. Please carry your ticket QR code.',
                'type' => 'important',
                'is_published' => true,
                'published_at' => now(),
            ],
        );

        $admin->notifications()->firstOrCreate(
            [
                'type' => 'App\Notifications\WelcomeNotification',
                'notifiable_id' => $admin->id,
                'notifiable_type' => User::class,
            ],
            ['id' => (string) Str::uuid(), 'data' => ['message' => 'Welcome to DuoFest!'], 'read_at' => null],
        );
    }

    private function demoUser(string $email, string $name, College $college, string $role): User
    {
        $user = User::query()->firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => 'password',
                'college_id' => $college->id,
            ],
        );

        $user->assignRole($role);

        return $user;
    }
}
