<?php

namespace App\Services\Event;

use App\Contracts\Services\EventCertificateServiceInterface;
use App\Enums\ActivityType;
use App\Enums\CertificateStatus;
use App\Exceptions\ApiException;
use App\Mail\CertificateMail;
use App\Models\Certificate;
use App\Models\Event;
use App\Models\Registration;
use App\Services\ActivityLog\ActivityLogService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class EventCertificateService implements EventCertificateServiceInterface
{
    private Filesystem $disk;

    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {
        $this->disk = Storage::disk('public');
    }

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
                        ->orWhereHas('user', fn ($q) => $q->where('email', 'like', "%{$search}%"))
                        ->orWhereHas('registration', fn ($q) => $q->where('email', 'like', "%{$search}%"));
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

                $certificate = $registration->certificates()->create([
                    'user_id' => $registration->user_id,
                    'template' => $data['template'] ?? null,
                    'expires_at' => $data['expires_at'] ?? null,
                    'status' => CertificateStatus::ISSUED->value,
                    'issued_at' => now(),
                ]);

                $this->generatePdf($certificate);

                $issued[] = $certificate;
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

    public function downloadPath(Certificate $certificate): ?string
    {
        if (! $certificate->hasFile()) {
            return null;
        }

        return $this->disk->path($certificate->file_path);
    }

    public function email(Certificate $certificate): Certificate
    {
        if ($certificate->status !== CertificateStatus::ISSUED) {
            throw new ApiException('This certificate has been revoked.', 422, errorCode: 'certificate_revoked');
        }

        $path = $this->downloadPath($certificate);

        if (! $path || ! is_file($path)) {
            throw new ApiException('The certificate PDF has not been generated.', 422, errorCode: 'certificate_not_generated');
        }

        $email = $certificate->contactEmail();

        if (! $email) {
            throw new ApiException('No contact email is available for this attendee.', 422, errorCode: 'no_contact_email');
        }

        Mail::to($email)->send(new CertificateMail($certificate, $path));

        $certificate->update(['emailed_at' => now()]);

        return $certificate;
    }

    public function emailAll(Event $event, ?array $certificateIds = null): array
    {
        $query = $event->certificates()
            ->with(['registration.event', 'user'])
            ->withoutTrashed()
            ->where('certificates.status', CertificateStatus::ISSUED->value)
            ->whereNotNull('certificates.file_path')
            ->whereNull('certificates.emailed_at');

        if ($certificateIds) {
            $query->whereIn('certificates.id', $certificateIds);
        }

        $sent = 0;
        $skipped = [];

        foreach ($query->get() as $certificate) {
            try {
                $this->email($certificate);
                $sent++;
            } catch (ApiException $exception) {
                $skipped[] = [
                    'id' => $certificate->getKey(),
                    'reason' => $exception->getErrorCode(),
                ];
            }
        }

        return ['sent' => $sent, 'skipped' => $skipped];
    }

    /**
     * Registrations eligible for a certificate. Only attendees with an actual
     * attendance record qualify (checked-in guests and account holders alike).
     * When ids are given they must belong to the event and have attendance.
     *
     * @param  list<int>|null  $registrationIds
     * @return Collection<int, Registration>
     */
    private function eligibleRegistrations(Event $event, ?array $registrationIds)
    {
        $query = $event->registrations()
            ->whereHas('attendance', fn ($q) => $q->where('event_id', $event->id));

        if ($registrationIds) {
            $query->whereIn('id', $registrationIds);
        }

        return $query->get();
    }

    /**
     * Render and persist the certificate PDF on the public disk.
     */
    private function generatePdf(Certificate $certificate): void
    {
        $certificate->load(['registration.event', 'registration.user', 'user']);

        $pdf = Pdf::loadView('pdfs.certificate', [
            'certificate' => $certificate,
        ]);

        $path = 'certificates/'.$certificate->uuid.'.pdf';

        $this->disk->put($path, $pdf->output());

        $certificate->update(['file_path' => $path]);
    }
}
