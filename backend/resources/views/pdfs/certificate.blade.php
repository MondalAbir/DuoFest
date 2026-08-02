<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Certificate - {{ $certificate->certificate_number }}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; color: #111827; margin: 0; padding: 24px; }
        .certificate { border: 10px solid #f59e0b; border-radius: 16px; padding: 48px 56px; text-align: center; }
        .brand { font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: #9ca3af; }
        h1 { margin: 10px 0 4px; font-size: 40px; letter-spacing: 1px; color: #111827; }
        .of { margin: 26px 0 6px; font-size: 13px; color: #6b7280; }
        .event-title { font-size: 26px; font-weight: bold; color: #b45309; }
        .recipient { margin-top: 34px; }
        .recipient .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        .recipient .name { font-size: 34px; font-weight: bold; border-bottom: 1px solid #e5e7eb; display: inline-block; padding: 0 28px 8px; }
        .body { margin: 22px auto 0; font-size: 13px; line-height: 1.8; color: #374151; max-width: 560px; }
        .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 44px; border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 11px; color: #6b7280; }
        .cert-number { font-weight: bold; color: #374151; letter-spacing: 1px; }
        .date { text-align: right; }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="brand">{{ config('app.name') }}</div>
        <h1>CERTIFICATE OF PARTICIPATION</h1>

        <div class="of">is proudly presented to</div>
        <div class="recipient">
            <div class="label">Attendee</div>
            <div class="name">{{ $certificate->registration?->name ?? $certificate->user?->name ?? $certificate->contactEmail() }}</div>
        </div>

        <div class="of">for attending</div>
        <div class="event-title">{{ $certificate->event?->title }}</div>

        <div class="body">
            {{ $certificate->event?->starts_at?->format('F j, Y') ? 'Held on '.$certificate->event->starts_at->format('F j, Y').'. ' : '' }}
            This certificate is awarded in recognition of the attendee's active participation.
        </div>

        <div class="footer">
            <div>
                <div>Certificate No.</div>
                <div class="cert-number">{{ $certificate->certificate_number }}</div>
            </div>
            <div class="date">
                <div>Issued on</div>
                <div>{{ $certificate->issued_at?->format('F j, Y') }}</div>
            </div>
        </div>
    </div>
</body>
</html>
