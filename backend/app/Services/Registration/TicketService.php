<?php

namespace App\Services\Registration;

use App\Contracts\Services\TicketServiceInterface;
use App\Enums\ActivityType;
use App\Enums\RegistrationStatus;
use App\Mail\EventTicketMail;
use App\Models\Registration;
use App\Services\ActivityLog\ActivityLogService;
use BaconQrCode\Renderer\GDLibRenderer;
use BaconQrCode\Writer;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class TicketService implements TicketServiceInterface
{
    private Filesystem $disk;

    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {
        $this->disk = Storage::disk('public');
    }

    public function issue(Registration $registration): Registration
    {
        if ($registration->status !== RegistrationStatus::CONFIRMED) {
            return $registration;
        }

        if ($registration->hasIssuedTicket()) {
            return $registration;
        }

        $registration->loadMissing('event');

        $encrypted = $this->encryptPayload($registration);
        $qrPath = $this->storeQr($encrypted, $registration);
        $pdfPath = $this->storePdf($registration, $qrPath);

        $registration->update([
            'ticket_payload' => $encrypted,
            'ticket_qr_path' => $qrPath,
            'ticket_pdf_path' => $pdfPath,
            'ticket_issued_at' => now(),
        ]);

        $this->activityLog->record(
            subject: $registration,
            type: ActivityType::TICKET_ISSUED,
            causer: null,
            description: "Issued ticket {$registration->ticket_number} to {$registration->contactEmail()}",
        );

        $this->sendTicketEmail($registration, $pdfPath);

        return $registration;
    }

    public function payload(Registration $registration): array
    {
        $event = $registration->event;

        return [
            'type' => 'duofest_ticket',
            'version' => 1,
            'ticket_number' => $registration->ticket_number,
            'event' => [
                'uuid' => $event?->uuid,
                'title' => $event?->title,
                'venue' => $event?->venue,
                'starts_at' => $event?->starts_at?->toISOString(),
                'ends_at' => $event?->ends_at?->toISOString(),
            ],
            'attendee' => [
                'name' => $registration->name ?? $registration->user?->name,
                'email' => $registration->contactEmail(),
            ],
            'issued_at' => $registration->ticket_issued_at?->toISOString() ?? now()->toISOString(),
        ];
    }

    public function encryptPayload(Registration $registration): string
    {
        return Crypt::encryptString((string) json_encode($this->payload($registration)));
    }

    public function downloadPath(Registration $registration): ?string
    {
        if (! $registration->ticket_pdf_path) {
            return null;
        }

        return $this->disk->path($registration->ticket_pdf_path);
    }

    /**
     * Render the QR code PNG from the encrypted payload.
     */
    private function storeQr(string $encryptedPayload, Registration $registration): string
    {
        $writer = new Writer(new GDLibRenderer(300, 4));
        $path = 'tickets/'.$registration->uuid.'.png';

        $this->disk->put($path, $writer->writeString($encryptedPayload));

        return $path;
    }

    /**
     * Render and persist the PDF ticket, embedding the QR as an inline image.
     */
    private function storePdf(Registration $registration, string $qrPath): string
    {
        $qrDataUri = 'data:image/png;base64,'.base64_encode((string) $this->disk->get($qrPath));

        $pdf = Pdf::loadView('pdfs.ticket', [
            'registration' => $registration,
            'qrDataUri' => $qrDataUri,
        ]);

        $path = 'tickets/'.$registration->uuid.'.pdf';

        $this->disk->put($path, $pdf->output());

        return $path;
    }

    private function sendTicketEmail(Registration $registration, string $pdfPath): void
    {
        $email = $registration->contactEmail();

        if (! $email) {
            return;
        }

        Mail::to($email)->send(new EventTicketMail($registration, $this->disk->path($pdfPath)));
    }
}
