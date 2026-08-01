<?php

namespace App\Services\Event;

use App\Contracts\Services\EventCertificateServiceInterface;
use App\Enums\ActivityType;
use App\Enums\CertificateStatus;
use App\Enums\RegistrationStatus;
use App\Models\Certificate;
use App\Models\Event;
use App\Models\Registration;
use App\Services\ActivityLog\ActivityLogService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class EventCertificateService implements EventCertificateServiceInterface
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function paginate(Event $event, array $filters = []): LengthAwarePaginator
    {
        return $event->certificates()
            ->with(['user', 'registration'])
            ->when($filters['user_id'] ?? null, fn ($query, $id) => $query->where('user_id', $id))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('certificate_number', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('user', fn ($q) => $q->where('email', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('issued_at')
            ->paginate((int) ($filters['per_page'] ?? config('api.per_page')));
    }

    public function issue(Event $event, array $data): array
    {
        return DB::transaction(function () use ($event, $data) {
            $registrations = $this->eligibleRegistrations($event, $data['registration_ids'] ?? null);

            $issued = [];

            foreach ($registrations as $registration) {
                if ($registration->certificates()->withoutTrashed()->exists()) {
                    continue;
                }

                $issued[] = $registration->certificates()->create([
                    'user_id' => $registration->user_id,
                    'template' => $data['template'] ?? null,
                    'expires_at' => $data['expires_at'] ?? null,
                    'status' => CertificateStatus::ISSUED->value,
                    'issued_at' => now(),
                ]);
            }

            if ($issued) {
                $this->activityLog->record(
                    subject: $event,
                    type: ActivityType::CERTIFICATE_ISSUED,
                    causer: request()->user(),
                    description: "Issued certificates for {$event->title}",
                    properties: ['count' => count($issued), 'registration_ids' => array_map(fn ($c) => $c->registration_id, $issued)],
                );
            }

            return $issued;
        });
    }

    public function revoke(Certificate $certificate): void
    {
        DB::transaction(function () use ($certificate) {
            $certificate->update(['status' => CertificateStatus::REVOKED->value]);
            $certificate->delete();

            $this->activityLog->record(
                subject: $certificate->registration->event,
                type: ActivityType::CERTIFICATE_REVOKED,
                causer: request()->user(),
                description: "Revoked certificate {$certificate->certificate_number}",
                properties: ['certificate_id' => $certificate->getKey()],
            );
        });
    }

    /**
     * Registrations eligible for a certificate. When ids are given they must
     * belong to the event and be confirmed/checked in; otherwise every checked
     * in attendee is eligible.
     *
     * @param  list<int>|null  $registrationIds
     * @return Collection<int, Registration>
     */
    private function eligibleRegistrations(Event $event, ?array $registrationIds)
    {
        $query = $event->registrations()->whereIn('status', [
            RegistrationStatus::CONFIRMED->value,
            RegistrationStatus::CHECKED_IN->value,
        ]);

        if ($registrationIds) {
            $query->whereIn('id', $registrationIds);
        } else {
            $query->where('status', RegistrationStatus::CHECKED_IN->value);
        }

        return $query->get();
    }
}
