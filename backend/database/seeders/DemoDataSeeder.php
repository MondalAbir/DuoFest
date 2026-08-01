<?php

namespace Database\Seeders;

use App\Enums\EventStatus;
use App\Enums\UserRole;
use App\Models\College;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;

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

        $admin = User::query()->firstOrCreate(
            ['email' => 'admin@duofest.test'],
            [
                'name' => 'DuoFest Admin',
                'password' => 'password',
                'college_id' => $college->id,
            ],
        );
        $admin->assignRole(UserRole::SUPER_ADMIN->value);

        $organizer = User::query()->firstOrCreate(
            ['email' => 'organizer@duofest.test'],
            [
                'name' => 'Event Organizer',
                'password' => 'password',
                'college_id' => $college->id,
            ],
        );
        $organizer->assignRole(UserRole::EVENT_MANAGER->value);

        $student = User::query()->firstOrCreate(
            ['email' => 'student@duofest.test'],
            [
                'name' => 'Student Attendee',
                'password' => 'password',
                'college_id' => $college->id,
            ],
        );
        $student->assignRole(UserRole::STUDENT->value);

        Event::query()->firstOrCreate(
            ['slug' => 'duofest-cultural-night-2026'],
            [
                'college_id' => $college->id,
                'organizer_id' => $organizer->id,
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

        Event::query()->firstOrCreate(
            ['slug' => 'tech-hackathon-2026'],
            [
                'college_id' => $college->id,
                'organizer_id' => $organizer->id,
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
    }
}
