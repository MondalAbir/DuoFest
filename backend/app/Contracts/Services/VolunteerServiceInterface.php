<?php

namespace App\Contracts\Services;

use App\Models\Attendance;
use App\Models\Event;
use App\Models\Registration;
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

    /**
     * Volunteer profile with aggregate stats.
     *
     * @return array<string, mixed>
     */
    public function profile(User $user): array;

    /**
     * Events the volunteer is actively assigned to.
     *
     * @return Collection<int, Volunteer>
     */
    public function assignedEvents(User $user): Collection;

    /**
     * Attendance entries scanned by this volunteer today.
     *
     * @return Collection<int, Attendance>
     */
    public function todayEntries(User $user): Collection;

    /**
     * Decode and evaluate a scanned ticket payload without recording it.
     *
     * @return array{status: string, registration: Registration|null}
     */
    public function validateScan(User $volunteer, Event $event, string $payload): array;

    /**
     * Validate a scanned ticket and record attendance for it.
     */
    public function checkInScan(User $volunteer, Event $event, string $payload): Attendance;
}
