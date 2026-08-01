<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CollegeAdminWelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
        $link = $frontendUrl !== '' ? $frontendUrl.'/login' : '';

        return (new MailMessage)
            ->subject('Your DuoFest college admin account is ready')
            ->greeting("Hello {$notifiable->name}!")
            ->line('A college admin account has been created for you on DuoFest.')
            ->line('You can sign in with the credentials provided by your organisation.')
            ->action('Sign in to DuoFest', $link)
            ->line('If you were not expecting this email, please contact your system administrator.');
    }
}
