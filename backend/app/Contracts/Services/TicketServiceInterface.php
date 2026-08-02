<?php

namespace App\Contracts\Services;

use App\Models\Registration;

interface TicketServiceInterface
{
    /**
     * Generate the encrypted QR payload, QR image, PDF ticket and email it.
     * Idempotent: skips already-issued tickets.
     */
    public function issue(Registration $registration): Registration;

    /**
     * Build the plain (unencrypted) ticket payload array.
     *
     * @return array<string, mixed>
     */
    public function payload(Registration $registration): array;

    /**
     * Encrypt the ticket payload for embedding in the QR code.
     */
    public function encryptPayload(Registration $registration): string;

    /**
     * Absolute path to the issued PDF ticket, or null when not issued.
     */
    public function downloadPath(Registration $registration): ?string;
}
