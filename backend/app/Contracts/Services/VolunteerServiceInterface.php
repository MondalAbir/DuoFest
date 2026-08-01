<?php

namespace App\Contracts\Services;

use App\Models\Event;
use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Database\Eloquent\Collection;

interface VolunteerServiceInterface
{
    /**
     * Add a single volunteer assignment for an event.
     *
     * @param  array<string, mixed>  $data
     */
    public function createForEvent(Event $event, array $data): Volunteer;

    /**
     * Bulk-assign users to an event, skipping already-assigned users.
     *
     * @param  list<int>  $userIds
     * @param  array<string, mixed>  $data
     * @return array{assigned: list<int>, skipped: list<int>}
     */
    public function assign(Event $event, array $userIds, array $data = []): array;

    public function remove(Volunteer $volunteer): void;

    /**
     * @return Collection<int, Volunteer>
     */
    public function assignmentsForUser(User $user);
}
