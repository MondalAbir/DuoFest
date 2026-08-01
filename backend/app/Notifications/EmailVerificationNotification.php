<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class EmailVerificationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addHours(24),
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())],
        );

        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
        $link = $frontendUrl !== ''
            ? $frontendUrl.'/verify-email?'.parse_url($verificationUrl, PHP_URL_QUERY)
            : $verificationUrl;

        return (new MailMessage)
            ->subject('Verify your email address')
            ->greeting("Hello {$notifiable->name}!")
            ->line('Thanks for joining DuoFest. Please verify your email address to activate your account.')
            ->action('Verify Email', $link)
            ->line('If you did not create this account, no further action is required.');
    }
}
