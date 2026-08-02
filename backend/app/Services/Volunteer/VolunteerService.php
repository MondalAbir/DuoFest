<?php

namespace App\Services\Volunteer;

use App\Contracts\Services\VolunteerServiceInterface;
use App\Enums\AttendanceStatus;
use App\Enums\RegistrationStatus;
use App\Enums\VolunteerStatus;
use App\Exceptions\ApiException;
use App\Models\Attendance;
use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Throwable;

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

    public function profile(User $user): array
    {
        $user->load('college', 'roles');

        return [
            'user' => $user,
            'assigned_events_count' => $user->volunteering()->active()->count(),
            'today_entries_count' => Attendance::query()
                ->where('checked_in_by', $user->getKey())
                ->whereDate('attended_at', today())
                ->count(),
        ];
    }

    public function assignedEvents(User $user): Collection
    {
        return $user->volunteering()
            ->active()
            ->with(['event', 'event.college'])
            ->get();
    }

    public function todayEntries(User $user): Collection
    {
        return Attendance::query()
            ->with(['event', 'registration'])
            ->where('checked_in_by', $user->getKey())
            ->whereDate('attended_at', today())
            ->orderByDesc('attended_at')
            ->get();
    }

    public function validateScan(User $volunteer, Event $event, string $payload): array
    {
        $this->assertAssigned($volunteer, $event);

        return $this->resolveTicket($event, $payload);
    }

    public function checkInScan(User $volunteer, Event $event, string $payload): Attendance
    {
        $this->assertAssigned($volunteer, $event);

        $result = $this->resolveTicket($event, $payload);

        if ($result['status'] !== 'valid') {
            $messages = [
                'already_entered' => 'This ticket has already been scanned.',
                'invalid_ticket' => 'This is not a valid DuoFest ticket.',
                'cancelled_ticket' => 'This ticket has been cancelled.',
            ];

            throw new ApiException(
                $messages[$result['status']] ?? 'This ticket cannot be used.',
                422,
                errorCode: $result['status'],
            );
        }

        $registration = $result['registration'];

        return DB::transaction(function () use ($volunteer, $event, $registration) {
            $attendance = Attendance::query()->create([
                'event_id' => $event->getKey(),
                'user_id' => $registration->user_id,
                'registration_id' => $registration->getKey(),
                'checked_in_by' => $volunteer->getKey(),
                'attended_at' => now(),
                'status' => AttendanceStatus::PRESENT->value,
            ]);

            $registration->update([
                'status' => RegistrationStatus::CHECKED_IN->value,
                'checked_in_at' => now(),
                'checked_in_by' => $volunteer->getKey(),
            ]);

            return $attendance;
        });
    }

    /**
     * Decode the encrypted QR payload and classify the ticket.
     *
     * @return array{status: string, registration: Registration|null}
     */
    private function resolveTicket(Event $event, string $payload): array
    {
        try {
            $decoded = json_decode(Crypt::decryptString($payload), true);
        } catch (Throwable) {
            return ['status' => 'invalid_ticket', 'registration' => null];
        }

        $ticketNumber = is_array($decoded) ? ($decoded['ticket_number'] ?? null) : null;

        if (! is_string($ticketNumber)) {
            return ['status' => 'invalid_ticket', 'registration' => null];
        }

        $registration = Registration::query()
            ->where('ticket_number', $ticketNumber)
            ->first();

        if (! $registration || (int) $registration->event_id !== (int) $event->getKey()) {
            return ['status' => 'invalid_ticket', 'registration' => null];
        }

        if ($registration->status === RegistrationStatus::CANCELLED) {
            return ['status' => 'cancelled_ticket', 'registration' => $registration];
        }

        if ($registration->status === RegistrationStatus::CHECKED_IN || $this->hasEntry($event, $registration)) {
            return ['status' => 'already_entered', 'registration' => $registration];
        }

        return ['status' => 'valid', 'registration' => $registration];
    }

    private function hasEntry(Event $event, Registration $registration): bool
    {
        return Attendance::query()
            ->where('event_id', $event->getKey())
            ->where(fn ($query) => $query
                ->where('registration_id', $registration->getKey())
                ->orWhere(fn ($query) => $query
                    ->whereNull('registration_id')
                    ->where('user_id', $registration->user_id)))
            ->exists();
    }

    private function assertAssigned(User $volunteer, Event $event): void
    {
        $assigned = $volunteer->volunteering()
            ->where('event_id', $event->getKey())
            ->whereIn('status', [VolunteerStatus::ASSIGNED->value, VolunteerStatus::ACCEPTED->value])
            ->exists();

        if (! $assigned) {
            throw new ApiException('You are not assigned to this event.', 403, errorCode: 'not_assigned_to_event');
        }
    }
}
