<?php

namespace Database\Factories;

use App\Enums\VolunteerStatus;
use App\Models\Event;
use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Volunteer>
 */
class VolunteerFactory extends Factory
{
    protected $model = Volunteer::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'user_id' => User::factory(),
            'assigned_by' => null,
            'role' => fake()->jobTitle(),
            'shift_start_at' => now()->addDays(7)->setTime(8, 0),
            'shift_end_at' => now()->addDays(7)->setTime(12, 0),
            'hours_volunteered' => fake()->randomFloat(2, 0, 8),
            'status' => VolunteerStatus::ASSIGNED->value,
            'notes' => null,
        ];
    }

    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VolunteerStatus::ACCEPTED->value,
        ]);
    }
}
