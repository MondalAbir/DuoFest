<?php

namespace App\Contracts\Services;

use App\Models\User;
use App\Models\VolunteerSlot;

interface VolunteerServiceInterface
{
    /**
     * @param  list<int>  $userIds
     * @return array{assigned: list<int>, skipped: list<int>}
     */
    public function assign(VolunteerSlot $slot, array $userIds): array;

    public function remove(VolunteerSlot $slot, User $user): void;

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, VolunteerSlot>
     */
    public function slotsForUser(User $user);
}
