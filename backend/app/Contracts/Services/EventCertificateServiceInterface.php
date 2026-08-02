<?php

namespace App\Contracts\Services;

use App\Models\Certificate;
use App\Models\Event;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface EventCertificateServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(Event $event, array $filters = []): LengthAwarePaginator;

    /**
     * Issue certificates to eligible registrations (those with attendance) and
     * generate + store their PDF. When no registration_ids are given, every
     * attendee with an attendance record is eligible; duplicates are skipped.
     *
     * @param  array<string, mixed>  $data
     * @return list<Certificate>
     */
    public function issue(Event $event, array $data): array;

    public function revoke(Certificate $certificate): void;

    /**
     * Absolute path of the stored certificate PDF, or null when none exists.
     */
    public function downloadPath(Certificate $certificate): ?string;

    /**
     * Email the certificate PDF to the attendee and stamp emailed_at.
     */
    public function email(Certificate $certificate): Certificate;

    /**
     * Bulk email every issued certificate (with a generated PDF) that has not
     * been emailed yet. Optionally restrict to the given certificate ids.
     *
     * @param  list<int>|null  $certificateIds
     * @return array{sent: int, skipped: list<array{id: int, reason: string}>}
     */
    public function emailAll(Event $event, ?array $certificateIds = null): array;
}
