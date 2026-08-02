<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>DuoFest Ticket</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; color: #1f2937; margin: 0; padding: 24px; }
        .ticket { border: 2px solid #111827; border-radius: 12px; padding: 28px; }
        .brand { font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #6b7280; }
        h1 { margin: 4px 0 2px; font-size: 26px; }
        .meta { margin-top: 18px; font-size: 13px; line-height: 1.7; }
        .meta strong { display: inline-block; min-width: 110px; }
        .footer { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; border-top: 1px dashed #d1d5db; padding-top: 18px; }
        .ticket-number { font-size: 15px; font-weight: bold; letter-spacing: 1px; }
        img.qr { width: 140px; height: 140px; }
        .hint { font-size: 11px; color: #6b7280; margin-top: 6px; }
    </style>
</head>
<body>
    <div class="ticket">
        <div class="brand">{{ config('app.name') }} &middot; Admission Ticket</div>
        <h1>{{ $registration->event->title }}</h1>

        <div class="meta">
            <div><strong>Attendee</strong> {{ $registration->name ?? $registration->contactEmail() }}</div>
            <div><strong>Email</strong> {{ $registration->contactEmail() }}</div>
            <div><strong>Date</strong> {{ $registration->event->starts_at?->format('l, F j, Y g:i A') }}</div>
            <div><strong>Venue</strong> {{ $registration->event->venue ?: 'TBA' }}</div>
        </div>

        <div class="footer">
            <div>
                <div class="ticket-number">{{ $registration->ticket_number }}</div>
                <div class="hint">Scan this QR code at the entrance for check-in.</div>
            </div>
            <div>
                <img class="qr" src="{{ $qrDataUri }}" alt="Ticket QR code">
            </div>
        </div>
    </div>
</body>
</html>
