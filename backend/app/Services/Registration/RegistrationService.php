<?php

namespace App\Services\Registration;

use App\Contracts\Services\RegistrationServiceInterface;
use App\Contracts\Services\TicketServiceInterface;
use App\Enums\EventStatus;
use App\Enums\RegistrationStatus;
use App\Exceptions\ApiException;
use App\Mail\RegistrationOtpMail;
use App\Models\Event;
use App\Models\Registration;
use App\Models\RegistrationOtp;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class RegistrationService implements RegistrationServiceInterface
{
    public function __construct(
        private readonly TicketServiceInterface $tickets,
    ) {}

    public function register(Event $event, User $user, array $attendeeDetails = []): Registration
    {
        $this->assertOpenForRegistration($event);

        if ($this->registrationExists($event, $user->email)) {
            throw new ApiException('You are already registered for this event.', 422, errorCode: 'already_registered');
        }

        $this->assertCapacity($event);

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

    public function requestOtp(Event $event, array $data): void
    {
        $this->assertOpenForRegistration($event);

        $email = strtolower(trim((string) $data['email']));

        if ($this->registrationExists($event, $email)) {
            throw new ApiException('You are already registered for this event.', 422, errorCode: 'already_registered');
        }

        $this->assertCapacity($event);

        $otp = (string) random_int(100000, 999999);
        $ttl = (int) config('api.registration.otp_ttl_minutes', 5);

        DB::transaction(function () use ($event, $email, $data, $otp, $ttl) {
            // Invalidate any earlier unconsumed codes for this event+email.
            RegistrationOtp::query()
                ->where('event_id', $event->getKey())
                ->where('email', $email)
                ->whereNull('consumed_at')
                ->update(['consumed_at' => now()]);

            RegistrationOtp::query()->create([
                'event_id' => $event->getKey(),
                'email' => $email,
                'name' => $data['name'],
                'phone' => $data['phone'] ?? null,
                'attendee_details' => $data['attendee_details'] ?? null,
                'otp_hash' => Hash::make($otp),
                'expires_at' => now()->addMinutes($ttl),
            ]);
        });

        Mail::to($email)->send(new RegistrationOtpMail($otp, $data['name'], $event, $ttl));
    }

    public function verifyOtp(Event $event, array $data): Registration
    {
        $this->assertOpenForRegistration($event);

        $email = strtolower(trim((string) $data['email']));

        $otp = RegistrationOtp::query()
            ->where('event_id', $event->getKey())
            ->where('email', $email)
            ->whereNull('consumed_at')
            ->orderByDesc('id')
            ->first();

        if (! $otp) {
            throw new ApiException('Invalid or expired verification code.', 422, errorCode: 'invalid_otp');
        }

        if ($otp->isExpired()) {
            $otp->consume();

            throw new ApiException('This verification code has expired. Please request a new one.', 422, errorCode: 'otp_expired');
        }

        if (! $otp->check($data['otp'])) {
            throw new ApiException('Invalid verification code.', 422, errorCode: 'invalid_otp');
        }

        $otp->consume();

        if ($this->registrationExists($event, $email)) {
            throw new ApiException('You are already registered for this event.', 422, errorCode: 'already_registered');
        }

        $this->assertCapacity($event);

        return DB::transaction(function () use ($event, $otp) {
            $registration = $event->registrations()->create([
                'user_id' => null,
                'name' => $otp->name,
                'email' => $otp->email,
                'phone' => $otp->phone,
                'attendee_details' => $otp->attendee_details,
                'status' => $event->requires_approval ? RegistrationStatus::PENDING->value : RegistrationStatus::CONFIRMED->value,
            ]);

            $event->increment('registration_count');

            if ($registration->status === RegistrationStatus::CONFIRMED) {
                $this->tickets->issue($registration);
            }

            return $registration;
        });
    }

    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return Registration::query()
            ->with(['event', 'user'])
            ->when($filters['event_id'] ?? null, fn ($query, $id) => $query->where('event_id', $id))
            ->when($filters['user_id'] ?? null, fn ($query, $id) => $query->where('user_id', $id))
            ->when($filters['email'] ?? null, fn ($query, $email) => $query->where('email', $email))
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

        if (! $registration->hasIssuedTicket()) {
            $this->tickets->issue($registration);
        }

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

    /**
     * A registration already exists for this attendee (account email or guest email).
     */
    private function registrationExists(Event $event, string $email): bool
    {
        $query = $event->registrations()
            ->whereNot('status', RegistrationStatus::CANCELLED->value)
            ->where(fn ($query) => $query
                ->where('email', $email)
                ->orWhereHas('user', fn ($query) => $query->where('email', $email)));

        return $query->exists();
    }

    private function assertCapacity(Event $event): void
    {
        if (! $event->capacity) {
            return;
        }

        $count = $event->registrations()
            ->whereNot('status', RegistrationStatus::CANCELLED->value)
            ->count();

        if ($count >= $event->capacity) {
            throw new ApiException('This event is at full capacity.', 422, errorCode: 'event_full');
        }
    }

    private function assertOpenForRegistration(Event $event): void
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
    }
}
