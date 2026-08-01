<?php

namespace App\Services\Registration;

use App\Contracts\Services\RegistrationServiceInterface;
use App\Enums\EventStatus;
use App\Enums\RegistrationStatus;
use App\Exceptions\ApiException;
use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class RegistrationService implements RegistrationServiceInterface
{
    public function register(Event $event, User $user, array $attendeeDetails = []): Registration
    {
        if (! in_array($event->status, [EventStatus::PUBLISHED, EventStatus::UPCOMING, EventStatus::LIVE], true)) {
            throw new ApiException('This event is not open for registration.', 422, errorCode: 'event_not_open');
        }

        if (! $event->registration_enabled) {
            throw new ApiException('Registrations are closed for this event.', 422, errorCode: 'registrations_closed');
        }

        if ($event->registration_open_at && $event->registration_open_at->isFuture()) {
            throw new ApiException('Registrations have not opened yet.', 422, errorCode: 'registrations_not_open');
        }

        if ($event->registration_closes_at && $event->registration_closes_at->isPast()) {
            throw new ApiException('Registrations have closed for this event.', 422, errorCode: 'registrations_closed');
        }

        if ($event->capacity && $event->registrations()->whereNot('status', RegistrationStatus::CANCELLED->value)->count() >= $event->capacity) {
            throw new ApiException('This event is at full capacity.', 422, errorCode: 'event_full');
        }

        return DB::transaction(function () use ($event, $user, $attendeeDetails) {
            $existing = $event->registrations()->where('user_id', $user->getKey())->first();

            if ($existing) {
                if ($existing->status === RegistrationStatus::CANCELLED) {
                    $existing->update([
                        'status' => RegistrationStatus::PENDING->value,
                        'attendee_details' => $attendeeDetails ?: null,
                    ]);

                    $event->increment('registration_count');

                    return $existing;
                }

                throw new ApiException('You are already registered for this event.', 422, errorCode: 'already_registered');
            }

            $registration = $event->registrations()->create([
                'user_id' => $user->getKey(),
                'status' => $event->requires_approval ? RegistrationStatus::PENDING->value : RegistrationStatus::CONFIRMED->value,
                'attendee_details' => $attendeeDetails ?: null,
            ]);

            $event->increment('registration_count');

            return $registration;
        });
    }

    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return Registration::query()
            ->with(['event', 'user'])
            ->when($filters['event_id'] ?? null, fn ($query, $id) => $query->where('event_id', $id))
            ->when($filters['user_id'] ?? null, fn ($query, $id) => $query->where('user_id', $id))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['ticket_number'] ?? null, fn ($query, $ticket) => $query->where('ticket_number', $ticket))
            ->orderByDesc('created_at')
            ->paginate((int) ($filters['per_page'] ?? config('api.per_page')));
    }

    public function find(int $id): Registration
    {
        return Registration::query()->with(['event', 'user', 'checkedInByUser'])->findOrFail($id);
    }

    public function cancel(Registration $registration): Registration
    {
        if ($registration->status === RegistrationStatus::CHECKED_IN) {
            throw new ApiException('A checked-in registration cannot be cancelled.', 422, errorCode: 'already_checked_in');
        }

        if ($registration->status === RegistrationStatus::CANCELLED) {
            throw new ApiException('This registration is already cancelled.', 422, errorCode: 'already_cancelled');
        }

        return DB::transaction(function () use ($registration) {
            $registration->update(['status' => RegistrationStatus::CANCELLED->value]);
            $registration->event()->decrement('registration_count');

            return $registration;
        });
    }

    public function confirm(Registration $registration): Registration
    {
        if ($registration->status === RegistrationStatus::CANCELLED) {
            throw new ApiException('A cancelled registration cannot be confirmed.', 422, errorCode: 'cancelled');
        }

        $registration->update(['status' => RegistrationStatus::CONFIRMED->value]);

        return $registration;
    }

    public function checkIn(Registration $registration, User $scanner): Registration
    {
        if ($registration->status === RegistrationStatus::CANCELLED) {
            throw new ApiException('A cancelled registration cannot be checked in.', 422, errorCode: 'cancelled');
        }

        if ($registration->status === RegistrationStatus::CHECKED_IN) {
            throw new ApiException('This ticket has already been checked in.', 422, errorCode: 'already_checked_in');
        }

        $registration->update([
            'status' => RegistrationStatus::CHECKED_IN->value,
            'checked_in_at' => now(),
            'checked_in_by' => $scanner->getKey(),
        ]);

        return $registration;
    }
}
