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
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator;

    public function find(int $id): Registration;

    public function cancel(Registration $registration): Registration;

    public function confirm(Registration $registration): Registration;

    public function checkIn(Registration $registration, User $scanner): Registration;
}
