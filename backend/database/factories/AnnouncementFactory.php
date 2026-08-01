<?php

namespace Database\Factories;

use App\Enums\AnnouncementType;
use App\Models\Announcement;
use App\Models\College;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Announcement>
 */
class AnnouncementFactory extends Factory
{
    protected $model = Announcement::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'college_id' => College::factory(),
            'event_id' => null,
            'created_by' => User::factory(),
            'title' => fake()->sentence(4),
            'body' => fake()->paragraph(),
            'type' => AnnouncementType::INFO->value,
            'is_published' => true,
            'published_at' => now(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => false,
            'published_at' => null,
        ]);
    }

    public function forEvent(Event $event): static
    {
        return $this->state(fn (array $attributes) => [
            'college_id' => $event->college_id,
            'event_id' => $event->id,
        ]);
    }
}
