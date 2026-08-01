<?php

namespace App\Services\Volunteer;

use App\Contracts\Services\VolunteerServiceInterface;
use App\Exceptions\ApiException;
use App\Models\User;
use App\Models\VolunteerSlot;
use Illuminate\Support\Collection;

class VolunteerService implements VolunteerServiceInterface
{
    public function assign(VolunteerSlot $slot, array $userIds): array
    {
        $userIds = array_values(array_unique(array_map('intval', $userIds)));

        $assigned = [];
        $skipped = [];

        foreach ($userIds as $userId) {
            $user = User::query()->find($userId);

            if (! $user) {
                $skipped[] = $userId;

                continue;
            }

            if ($slot->volunteers()->where('users.id', $userId)->exists()) {
                $skipped[] = $userId;

                continue;
            }

            if ($slot->volunteers()->count() >= $slot->capacity) {
                throw new ApiException('This volunteer slot is full.', 422, errorCode: 'slot_full');
            }

            $slot->volunteers()->attach($user->getKey(), ['status' => 'assigned']);
            $assigned[] = $userId;
        }

        return compact('assigned', 'skipped');
    }

    public function remove(VolunteerSlot $slot, User $user): void
    {
        $detached = $slot->volunteers()->detach($user->getKey());

        if ($detached === 0) {
            throw new ApiException('This user is not assigned to the slot.', 404, errorCode: 'not_assigned');
        }
    }

    public function slotsForUser(User $user): Collection
    {
        return $user->volunteerSlots()->with('event')->get();
    }
}
