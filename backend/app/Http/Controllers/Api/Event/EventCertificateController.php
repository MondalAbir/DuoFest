<?php

namespace App\Http\Controllers\Api\Event;

use App\Contracts\Services\EventCertificateServiceInterface;
use App\Exceptions\ApiException;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Event\EmailCertificatesRequest;
use App\Http\Requests\Event\IssueCertificateRequest;
use App\Http\Resources\CertificateResource;
use App\Models\Certificate;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

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

    /**
     * Download the generated certificate PDF.
     */
    public function download(Event $event, Certificate $certificate): BinaryFileResponse|JsonResponse
    {
        $path = $this->certificateService->downloadPath($certificate);

        if (! $path || ! is_file($path)) {
            throw new ApiException('The certificate PDF has not been generated.', 404, errorCode: 'certificate_not_generated');
        }

        $filename = 'duofest-certificate-'.$certificate->certificate_number.'.pdf';

        return response()
            ->download($path, $filename)
            ->setContentDisposition('inline', $filename);
    }

    /**
     * Email a single certificate to its attendee.
     */
    public function email(Event $event, Certificate $certificate): JsonResponse
    {
        $this->certificateService->email($certificate);

        return $this->success(
            new CertificateResource($certificate->load(['user', 'registration'])),
            'Certificate emailed successfully.',
        );
    }

    /**
     * Bulk email every unemailed, issued certificate (optionally filtered by ids).
     */
    public function emailAll(EmailCertificatesRequest $request, Event $event): JsonResponse
    {
        $result = $this->certificateService->emailAll($event, $request->validated('certificate_ids'));

        return $this->success($result, "Emailed certificates to {$result['sent']} attendee(s).");
    }
}
