<?php

namespace App\Services\Volunteer;

use App\Contracts\Services\VolunteerServiceInterface;
use App\Exceptions\ApiException;
use App\Models\Event;
use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Database\Eloquent\Collection;

class VolunteerService implements VolunteerServiceInterface
{
    public function createForEvent(Event $event, array $data): Volunteer
    {
        if ($event->volunteers()->where('user_id', $data['user_id'])->exists()) {
            throw new ApiException('This user is already assigned as a volunteer.', 422, errorCode: 'already_assigned');
        }

        return $event->volunteers()->create($data);
    }

    public function assign(Event $event, array $userIds, array $data = []): array
    {
        $userIds = array_values(array_unique(array_map('intval', $userIds)));

        $assigned = [];
        $skipped = [];

        foreach ($userIds as $userId) {
            if (! User::query()->whereKey($userId)->exists()) {
                $skipped[] = $userId;

                continue;
            }

            if ($event->volunteers()->where('user_id', $userId)->exists()) {
                $skipped[] = $userId;

                continue;
            }

            $event->volunteers()->create(array_merge($data, ['user_id' => $userId]));
            $assigned[] = $userId;
        }

        return compact('assigned', 'skipped');
    }

    public function remove(Volunteer $volunteer): void
    {
        $volunteer->delete();
    }

    public function assignmentsForUser(User $user): Collection
    {
        return $user->volunteering()->with('event')->get();
    }
}
