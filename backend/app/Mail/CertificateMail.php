<?php

namespace App\Mail;

use App\Models\Certificate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CertificateMail extends Mailable implements ShouldQueue
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly Certificate $certificate,
        public readonly string $pdfPath,
    ) {}

    public function envelope(): Envelope
    {
        $eventTitle = $this->certificate->event?->title ?? 'the event';

        return new Envelope(
            subject: "Your certificate for {$eventTitle}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.certificate',
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromPath($this->pdfPath)
                ->as('duofest-certificate-'.$this->certificate->certificate_number.'.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
