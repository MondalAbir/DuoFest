<?php

namespace App\Contracts\Services;

use App\Models\Event;
use App\Models\EventSponsor;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface EventSponsorServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(Event $event, array $filters = []): LengthAwarePaginator;

    /**
     * @param  array<string, mixed>  $data
     */
    public function store(Event $event, array $data): EventSponsor;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(EventSponsor $sponsor, array $data): EventSponsor;

    public function delete(EventSponsor $sponsor): void;
}
