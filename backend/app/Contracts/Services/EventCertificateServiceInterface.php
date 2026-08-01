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
     * Issue certificates to registrations. When no registration_ids are given,
     * certificates are issued to every checked-in attendee.
     *
     * @param  array<string, mixed>  $data
     * @return list<Certificate>
     */
    public function issue(Event $event, array $data): array;

    public function revoke(Certificate $certificate): void;
}
