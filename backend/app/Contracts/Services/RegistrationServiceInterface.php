<?php

namespace App\Contracts\Services;

use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface RegistrationServiceInterface
{
    public function register(Event $event, User $user, array $attendeeDetails = []): Registration;

    /**
     * Send an OTP email for a guest registration (no account required).
     *
     * @param  array<string, mixed>  $data  name, email, phone, attendee_details
     */
    public function requestOtp(Event $event, array $data): void;

    /**
     * Verify the emailed OTP and store the guest registration.
     *
     * @param  array<string, mixed>  $data  email, otp
     */
    public function verifyOtp(Event $event, array $data): Registration;

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator;

    public function find(int $id): Registration;

    public function cancel(Registration $registration): Registration;

    public function confirm(Registration $registration): Registration;

    public function checkIn(Registration $registration, User $scanner): Registration;
}
