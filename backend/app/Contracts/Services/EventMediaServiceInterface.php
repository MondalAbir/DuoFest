<?php

namespace App\Contracts\Services;

use App\Models\Event;
use App\Models\EventMedia;
use Illuminate\Database\Eloquent\Collection;

interface EventMediaServiceInterface
{
    public function forEvent(Event $event): Collection;

    public function banner(Event $event): ?EventMedia;

    /**
     * Store an uploaded image as the event banner or a gallery item. Uploading
     * a new banner replaces any existing banner for the event.
     *
     * @param  array<string, mixed>  $data
     */
    public function store(Event $event, array $data): EventMedia;

    public function delete(EventMedia $media): void;
}
