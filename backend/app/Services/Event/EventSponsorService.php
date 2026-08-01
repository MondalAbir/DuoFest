<?php

namespace App\Services\Event;

use App\Contracts\Services\EventSponsorServiceInterface;
use App\Enums\ActivityType;
use App\Models\Event;
use App\Models\EventSponsor;
use App\Services\ActivityLog\ActivityLogService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class EventSponsorService implements EventSponsorServiceInterface
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function paginate(Event $event, array $filters = []): LengthAwarePaginator
    {
        return $event->sponsors()
            ->when($filters['tier'] ?? null, fn ($query, $tier) => $query->where('tier', $tier))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('sort_order')
            ->paginate((int) ($filters['per_page'] ?? config('api.per_page')));
    }

    public function store(Event $event, array $data): EventSponsor
    {
        return DB::transaction(function () use ($event, $data) {
            $sponsor = $event->sponsors()->create($data);

            $this->activityLog->record(
                subject: $event,
                type: ActivityType::SPONSOR_ADDED,
                causer: request()->user(),
                description: "Added sponsor {$sponsor->name} to {$event->title}",
                properties: ['sponsor_id' => $sponsor->getKey(), 'tier' => $sponsor->tier?->value],
            );

            return $sponsor;
        });
    }

    public function update(EventSponsor $sponsor, array $data): EventSponsor
    {
        $sponsor->update($data);

        return $sponsor;
    }

    public function delete(EventSponsor $sponsor): void
    {
        DB::transaction(function () use ($sponsor) {
            $sponsor->delete();

            $this->activityLog->record(
                subject: $sponsor->event,
                type: ActivityType::SPONSOR_REMOVED,
                causer: request()->user(),
                description: "Removed sponsor {$sponsor->name} from {$sponsor->event->title}",
            );
        });
    }
}
