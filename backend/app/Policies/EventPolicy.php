<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;

class EventPolicy
{
    /**
     * Whether the user can browse all events including drafts and archives.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('event.view_any');
    }

    public function view(User $user, Event $event): bool
    {
        return $user->can('event.view');
    }

    public function create(User $user): bool
    {
        return $user->can('event.create');
    }

    public function update(User $user, Event $event): bool
    {
        return $user->can('event.update') || $event->organizer_id === $user->getKey();
    }

    public function delete(User $user, Event $event): bool
    {
        return $user->can('event.delete');
    }

    public function publish(User $user, Event $event): bool
    {
        return $user->can('event.publish');
    }

    public function unpublish(User $user, Event $event): bool
    {
        return $user->can('event.publish');
    }

    public function archive(User $user, Event $event): bool
    {
        return $user->can('event.archive');
    }

    public function unarchive(User $user, Event $event): bool
    {
        return $user->can('event.archive');
    }

    public function manageMedia(User $user, Event $event): bool
    {
        return $user->can('event.media');
    }

    public function manageSponsors(User $user, Event $event): bool
    {
        return $user->can('event.sponsor');
    }

    public function manageCertificates(User $user, Event $event): bool
    {
        return $user->can('event.certificate');
    }
}
