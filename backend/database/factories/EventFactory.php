<?php

namespace Database\Factories;

use App\Enums\EventStatus;
use App\Models\College;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    protected $model = Event::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'college_id' => College::factory(),
            'organizer_id' => User::factory(),
            'event_category_id' => EventCategory::factory(),
            'title' => fake()->unique()->catchPhrase(),
            'description' => fake()->paragraph(),
            'venue' => fake()->streetAddress(),
            'starts_at' => now()->addDays(7)->setTime(10, 0),
            'ends_at' => now()->addDays(7)->setTime(18, 0),
            'status' => EventStatus::DRAFT->value,
            'capacity' => 100,
            'registration_count' => 0,
            'requires_approval' => true,
            'is_featured' => false,
            'cover_image_url' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => EventStatus::PUBLISHED->value,
        ]);
    }
}
