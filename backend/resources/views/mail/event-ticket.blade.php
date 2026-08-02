# You're registered!

Hi **{{ $registration->name ?? $registration->contactEmail() }}**,

Your ticket for **{{ $registration->event->title }}** is attached to this email.

- **Ticket number:** `{{ $registration->ticket_number }}`
- **Date:** {{ $registration->event->starts_at?->format('l, F j, Y g:i A') }}
- **Venue:** {{ $registration->event->venue ?: 'TBA' }}

Please bring the attached ticket on your phone or printed. Present the QR code at the entrance for check-in.

Thanks,

{{ config('app.name') }}
