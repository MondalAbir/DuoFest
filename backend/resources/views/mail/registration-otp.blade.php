# Verify your registration

Hello **{{ $name }}**,

Use the code below to complete your registration for **{{ $event->title }}**. The code expires in **{{ $ttlMinutes }} minutes**.

> ### {{ $otp }}

If you did not request this code, you can safely ignore this email.

Thanks,

{{ config('app.name') }}
