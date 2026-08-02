<?php

namespace Database\Factories;

use App\Enums\RegistrationStatus;
use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Registration>
 */
class RegistrationFactory extends Factory
{
    protected $model = Registration::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'user_id' => User::factory(),
            'ticket_number' => Registration::generateTicketNumber(),
            'status' => RegistrationStatus::PENDING->value,
            'attendee_details' => null,
            'checked_in_at' => null,
            'checked_in_by' => null,
        ];
    }

    /**
     * A guest registration with no linked account.
     */
    public function guest(): static
    {
        return $this->state(fn () => [
            'user_id' => null,
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => null,
        ]);
    }
}
