<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\Registration;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'registration_id' => Registration::factory(),
            'event_id' => function (array $attributes) {
                return Registration::find($attributes['registration_id'])->event_id;
            },
            'user_id' => function (array $attributes) {
                return Registration::find($attributes['registration_id'])->user_id;
            },
            'amount' => $this->faker->randomFloat(2, 10, 500),
            'currency' => 'USD',
            'payment_method' => $this->faker->randomElement(['card', 'cash', 'bKash']),
            'reference' => strtoupper($this->faker->bothify('PAY-####-????')),
            'status' => PaymentStatus::PENDING->value,
            'paid_at' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::COMPLETED->value,
            'paid_at' => now(),
        ]);
    }

    public function forRegistration(Registration $registration): static
    {
        return $this->state(fn () => [
            'registration_id' => $registration->id,
            'event_id' => $registration->event_id,
            'user_id' => $registration->user_id,
        ]);
    }
}
