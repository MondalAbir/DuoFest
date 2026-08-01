<?php

namespace App\Services\Event;

use App\Contracts\Services\EventServiceInterface;
use App\Enums\ActivityType;
use App\Enums\EventStatus;
use App\Models\Event;
use App\Services\ActivityLog\ActivityLogService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class EventService implements EventServiceInterface
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function paginate(array $filters = [], bool $isAdmin = false): LengthAwarePaginator
    {
        return $this->baseQuery($filters, $isAdmin)
            ->orderByDesc('starts_at')
            ->paginate((int) ($filters['per_page'] ?? config('api.per_page')));
    }

    public function featured(array $filters = []): LengthAwarePaginator
    {
        return $this->baseQuery(['is_featured' => true] + $filters)
            ->orderByDesc('starts_at')
            ->paginate((int) ($filters['per_page'] ?? config('api.per_page')));
    }

    public function upcoming(array $filters = []): LengthAwarePaginator
    {
        return $this->baseQuery(['upcoming' => true] + $filters)
            ->orderBy('starts_at')
            ->paginate((int) ($filters['per_page'] ?? config('api.per_page')));
    }

    public function search(string $query, array $filters = []): LengthAwarePaginator
    {
        return $this->baseQuery(['search' => $query] + $filters)
            ->orderByDesc('starts_at')
            ->paginate((int) ($filters['per_page'] ?? config('api.per_page')));
    }

    public function find(int $id): Event
    {
        return Event::query()
            ->with(['college', 'organizer', 'category', 'banner', 'gallery', 'sponsors', 'registrations.user'])
            ->withCount('registrations')
            ->findOrFail($id);
    }

    public function findBySlug(string $slug): Event
    {
        return Event::query()
            ->with(['college', 'organizer', 'category', 'banner', 'gallery', 'sponsors'])
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

        return $event->load(['college', 'organizer', 'category']);
    }

    public function delete(Event $event): void
    {
        $event->delete();
    }

    public function publish(Event $event): Event
    {
        if ($event->status === EventStatus::ARCHIVED) {
            throw new \RuntimeException('An archived event cannot be published.');
        }

        $previous = $event->status;

        if ($previous === EventStatus::DRAFT || $previous === EventStatus::ARCHIVED) {
            $event->status = EventStatus::PUBLISHED;
            $event->archived_from = null;
            $event->save();
        }

        $this->recordTransition($event, ActivityType::PUBLISHED, 'Published event', $previous);

        return $event->refresh();
    }

    public function unpublish(Event $event): Event
    {
        $previous = $event->status;

        if ($previous !== EventStatus::ARCHIVED) {
            $event->status = EventStatus::DRAFT;
            $event->save();
        }

        $this->recordTransition($event, ActivityType::UNPUBLISHED, 'Unpublished event', $previous);

        return $event->refresh();
    }

    public function archive(Event $event): Event
    {
        if ($event->status === EventStatus::ARCHIVED) {
            return $event;
        }

        $previous = $event->status;

        $event->status = EventStatus::ARCHIVED;
        $event->archived_from = $previous?->value;
        $event->save();

        $this->recordTransition($event, ActivityType::ARCHIVED, 'Archived event', $previous);

        return $event->refresh();
    }

    public function unarchive(Event $event): Event
    {
        if ($event->status !== EventStatus::ARCHIVED) {
            return $event;
        }

        $previous = $event->archived_from;

        $event->status = $previous ? EventStatus::tryFrom($previous) : EventStatus::DRAFT;
        $event->archived_from = null;
        $event->save();

        $this->recordTransition($event, ActivityType::UNARCHIVED, 'Unarchived event', EventStatus::ARCHIVED);

        return $event->refresh();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function baseQuery(array $filters = [], bool $isAdmin = false): Builder
    {
        return Event::query()
            ->with(['college', 'organizer', 'category'])
            ->withCount('registrations')
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('venue', 'like', "%{$search}%");
                });
            })
            ->when($filters['college_id'] ?? null, fn ($query, $id) => $query->where('college_id', $id))
            ->when($filters['category_id'] ?? null, fn ($query, $id) => $query->where('event_category_id', $id))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when(isset($filters['is_featured']), function ($query) use ($filters) {
                $query->where('is_featured', filter_var($filters['is_featured'], FILTER_VALIDATE_BOOL));
            })
            ->when(! $isAdmin && ! isset($filters['status']), function ($query) use ($filters) {
                $this->applyVisibility($query, $filters);
            });
    }

    private function applyVisibility(Builder $query, array $filters): void
    {
        $phase = $filters['phase'] ?? null;

        if (! $phase && ($filters['upcoming'] ?? false) && ($filters['upcoming'] !== 'false')) {
            $phase = 'upcoming';
        }

        match ($phase) {
            'upcoming' => $query->visible()->upcoming(),
            'ongoing' => $query->visible()->ongoing(),
            'completed' => $query->completed()->whereNotIn('status', [
                EventStatus::ARCHIVED->value,
                EventStatus::CANCELLED->value,
            ]),
            default => $query->visible(),
        };
    }

    private function recordTransition(Event $event, ActivityType $type, string $description, ?EventStatus $previous): void
    {
        $this->activityLog->record(
            subject: $event,
            type: $type,
            causer: request()->user(),
            description: "{$description} {$event->title}",
            properties: ['previous_status' => $previous?->value, 'status' => $event->status->value],
        );
    }
}
