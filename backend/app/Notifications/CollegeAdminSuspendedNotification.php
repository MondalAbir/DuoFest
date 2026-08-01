<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CollegeAdminSuspendedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your DuoFest college admin account has been suspended')
            ->greeting("Hello {$notifiable->name}!")
            ->line('Your college admin account on DuoFest has been suspended.')
            ->line('You will not be able to sign in until an administrator restores your access.')
            ->line('If you believe this is a mistake, please contact your system administrator.');
    }
}
