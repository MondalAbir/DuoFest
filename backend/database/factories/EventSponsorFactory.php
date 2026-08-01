<?php

namespace Database\Factories;

use App\Enums\SponsorTier;
use App\Models\Event;
use App\Models\EventSponsor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventSponsor>
 */
class EventSponsorFactory extends Factory
{
    protected $model = EventSponsor::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'name' => fake()->company(),
            'logo_url' => fake()->imageUrl(200, 200, 'business'),
            'website_url' => fake()->url(),
            'tier' => fake()->randomElement(SponsorTier::values()),
            'sort_order' => 0,
        ];
    }
}
