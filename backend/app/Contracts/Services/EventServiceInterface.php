<?php

namespace App\Contracts\Services;

use App\Models\Event;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface EventServiceInterface
{
    /**
     * Paginate events. When $isAdmin is false only publicly visible events are
     * returned (unless an explicit status/phase filter is supplied).
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = [], bool $isAdmin = false): LengthAwarePaginator;

    /**
     * Public feed of featured events.
     *
     * @param  array<string, mixed>  $filters
     */
    public function featured(array $filters = []): LengthAwarePaginator;

    /**
     * Public feed of upcoming events (soonest first).
     *
     * @param  array<string, mixed>  $filters
     */
    public function upcoming(array $filters = []): LengthAwarePaginator;

    /**
     * Public full-text search across title, description and venue.
     *
     * @param  array<string, mixed>  $filters
     */
    public function search(string $query, array $filters = []): LengthAwarePaginator;

    public function find(int $id): Event;

    public function findBySlug(string $slug): Event;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Event;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Event $event, array $data): Event;

    public function delete(Event $event): void;

    public function publish(Event $event): Event;

    public function unpublish(Event $event): Event;

    public function archive(Event $event): Event;

    public function unarchive(Event $event): Event;
}
