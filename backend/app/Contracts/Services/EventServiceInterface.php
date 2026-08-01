<?php

namespace App\Contracts\Services;

use App\Models\Event;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface EventServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator;

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
}
