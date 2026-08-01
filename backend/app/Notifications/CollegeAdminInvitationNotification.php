<?php

namespace App\Notifications;

use App\Models\College;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CollegeAdminInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected readonly ?College $college = null,
        protected readonly ?string $setupToken = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
        $collegeName = $this->college?->name ?? 'a college';

        if ($this->setupToken) {
            $link = $frontendUrl !== ''
                ? $frontendUrl.'/reset-password?token='.$this->setupToken.'&email='.urlencode($notifiable->email)
                : $this->setupToken;

            $action = 'Accept Invitation';
            $instruction = 'Set your password to accept the invitation and get started.';
        } else {
            $link = $frontendUrl !== '' ? $frontendUrl.'/login' : $collegeName;

            $action = 'Sign in to DuoFest';
            $instruction = 'You can sign in now to start managing events and registrations for your college.';
        }

        return (new MailMessage)
            ->subject("You're invited to administer {$collegeName}")
            ->greeting("Hello {$notifiable->name}!")
            ->line("You have been invited to be a College Admin for **{$collegeName}** on DuoFest.")
            ->line($instruction)
            ->action($action, $link)
            ->line('If you were not expecting this invitation, you can safely ignore this email.');
    }
}
