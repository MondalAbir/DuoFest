<?php

namespace Database\Factories;

use App\Enums\AttendanceStatus;
use App\Models\Attendance;
use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Attendance>
 */
class AttendanceFactory extends Factory
{
    protected $model = Attendance::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'user_id' => User::factory(),
            'registration_id' => null,
            'checked_in_by' => null,
            'attended_at' => now(),
            'status' => AttendanceStatus::PRESENT->value,
        ];
    }

    public function forRegistration(Registration $registration): static
    {
        return $this->state(fn (array $attributes) => [
            'event_id' => $registration->event_id,
            'user_id' => $registration->user_id,
            'registration_id' => $registration->id,
        ]);
    }
}
