<?php

namespace App\Http\Controllers\Api\Event;

use App\Contracts\Services\EventCertificateServiceInterface;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Event\IssueCertificateRequest;
use App\Http\Resources\CertificateResource;
use App\Models\Certificate;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventCertificateController extends ApiController
{
    public function __construct(
        private readonly EventCertificateServiceInterface $certificateService,
    ) {}

    public function index(Request $request, Event $event): JsonResponse
    {
        $certificates = $this->certificateService->paginate($event, $request->only([
            'search', 'user_id', 'status', 'per_page',
        ]));

        return $this->paginated(CertificateResource::collection($certificates));
    }

    public function store(IssueCertificateRequest $request, Event $event): JsonResponse
    {
        $issued = $this->certificateService->issue($event, $request->validated());

        return $this->created(
            CertificateResource::collection($issued),
            count($issued) > 0 ? "Issued {$event->title} certificates to ".count($issued).' attendee(s).' : 'No new certificates were issued.',
        );
    }

    public function destroy(Event $event, Certificate $certificate): JsonResponse
    {
        $this->certificateService->revoke($certificate);

        return $this->success(null, 'Certificate revoked successfully.');
    }
}
