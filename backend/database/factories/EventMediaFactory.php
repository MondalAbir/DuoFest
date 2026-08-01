<?php

namespace Database\Factories;

use App\Enums\EventMediaType;
use App\Models\Event;
use App\Models\EventMedia;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventMedia>
 */
class EventMediaFactory extends Factory
{
    protected $model = EventMedia::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'type' => EventMediaType::GALLERY->value,
            'file_path' => 'events/'.fake()->uuid().'.jpg',
            'alt_text' => fake()->sentence(),
            'sort_order' => 0,
        ];
    }

    public function banner(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => EventMediaType::BANNER->value,
        ]);
    }
}
