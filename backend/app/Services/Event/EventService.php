<?php

namespace App\Services\Event;

use App\Contracts\Services\EventServiceInterface;
use App\Enums\EventStatus;
use App\Exceptions\ApiException;
use App\Models\Event;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EventService implements EventServiceInterface
{
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return Event::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('venue', 'like', "%{$search}%");
                });
            })
            ->when($filters['college_id'] ?? null, fn ($query, $id) => $query->where('college_id', $id))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when(($filters['upcoming'] ?? false) && ($filters['upcoming'] !== 'false'), fn ($query) => $query->upcoming())
            ->when(isset($filters['is_featured']), function ($query) use ($filters) {
                $query->where('is_featured', filter_var($filters['is_featured'], FILTER_VALIDATE_BOOL));
            })
            ->with(['college', 'organizer'])
            ->withCount('registrations')
            ->orderByDesc('starts_at')
            ->paginate((int) ($filters['per_page'] ?? config('api.per_page')));
    }

    public function find(int $id): Event
    {
        return Event::query()
            ->with(['college', 'organizer', 'registrations.user'])
            ->withCount('registrations')
            ->findOrFail($id);
    }

    public function findBySlug(string $slug): Event
    {
        return Event::query()
            ->with(['college', 'organizer'])
            ->withCount('registrations')
            ->where('slug', $slug)
            ->firstOrFail();
    }

    public function create(array $data): Event
    {
        return Event::query()->create($data);
    }

    public function update(Event $event, array $data): Event
    {
        $event->update($data);

        return $event->load(['college', 'organizer']);
    }

    public function delete(Event $event): void
    {
        $event->delete();
    }

    public function publish(Event $event): Event
    {
        if ($event->status === EventStatus::DRAFT) {
            $event->status = EventStatus::PUBLISHED;
            $event->save();
        }

        return $event->refresh();
    }

    public function unpublish(Event $event): Event
    {
        $event->status = EventStatus::DRAFT;
        $event->save();

        return $event->refresh();
    }
}
