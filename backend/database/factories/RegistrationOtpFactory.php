<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\RegistrationOtp;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<RegistrationOtp>
 */
class RegistrationOtpFactory extends Factory
{
    protected $model = RegistrationOtp::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'email' => fake()->safeEmail(),
            'name' => fake()->name(),
            'phone' => null,
            'attendee_details' => null,
            'otp_hash' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(5),
            'consumed_at' => null,
        ];
    }

    /**
     * Use a known OTP value.
     */
    public function withOtp(string $otp = '123456'): static
    {
        return $this->state(fn () => ['otp_hash' => Hash::make($otp)]);
    }

    /**
     * Make the OTP already expired.
     */
    public function expired(): static
    {
        return $this->state(fn () => ['expires_at' => now()->subMinute()]);
    }

    public function consumed(): static
    {
        return $this->state(fn () => ['consumed_at' => now()]);
    }
}
