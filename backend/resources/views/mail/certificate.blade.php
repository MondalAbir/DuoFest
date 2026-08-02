<x-mail::message>
# Congratulations!

You are receiving this email because you attended **{{ $certificate->event?->title }}** and earned a certificate of participation.

Your certificate number is **{{ $certificate->certificate_number }}**.

Your certificate is attached to this email as a PDF. You can download it, print it, or share it directly from the attachment.

Keep up the great work!

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
