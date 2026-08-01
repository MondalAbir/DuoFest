<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\VolunteerSlot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VolunteerSlot>
 */
class VolunteerSlotFactory extends Factory
{
    protected $model = VolunteerSlot::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'name' => fake()->words(2, true),
            'starts_at' => now()->addDays(7)->setTime(8, 0),
            'ends_at' => now()->addDays(7)->setTime(12, 0),
            'capacity' => 5,
        ];
    }
}
