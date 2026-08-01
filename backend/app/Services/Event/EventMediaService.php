<?php

namespace App\Services\Event;

use App\Contracts\Services\EventMediaServiceInterface;
use App\Enums\ActivityType;
use App\Enums\EventMediaType;
use App\Models\Event;
use App\Models\EventMedia;
use App\Services\ActivityLog\ActivityLogService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EventMediaService implements EventMediaServiceInterface
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function forEvent(Event $event): Collection
    {
        return $event->media()->orderBy('sort_order')->get();
    }

    public function banner(Event $event): ?EventMedia
    {
        return $event->banner()->first();
    }

    public function store(Event $event, array $data): EventMedia
    {
        /** @var UploadedFile $image */
        $image = $data['image'];
        $type = EventMediaType::tryFrom($data['type']);

        if ($type === EventMediaType::BANNER) {
            $existing = $this->banner($event);

            if ($existing) {
                if ($existing->file_path && Storage::disk('public')->exists($existing->file_path)) {
                    Storage::disk('public')->delete($existing->file_path);
                }

                $existing->delete();
            }
        }

        $media = DB::transaction(function () use ($event, $image, $data) {
            $path = $image->storeAs(
                'events/'.$event->uuid,
                $this->filename($image),
                'public',
            );

            $media = $event->media()->create([
                'type' => $data['type'],
                'file_path' => $path,
                'alt_text' => $data['alt_text'] ?? null,
                'sort_order' => $data['sort_order'] ?? 0,
            ]);

            $this->activityLog->record(
                subject: $event,
                type: ActivityType::MEDIA_UPLOADED,
                causer: request()->user(),
                description: "Uploaded {$data['type']} media for {$event->title}",
                properties: ['media_id' => $media->getKey(), 'type' => $data['type']],
            );

            return $media;
        });

        return $media->load('event');
    }

    public function delete(EventMedia $media): void
    {
        DB::transaction(function () use ($media) {
            $path = $media->file_path;

            $media->delete();

            if ($path && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }

            $this->activityLog->record(
                subject: $media->event,
                type: ActivityType::MEDIA_DELETED,
                causer: request()->user(),
                description: "Removed {$media->type->value} media from {$media->event->title}",
            );
        });
    }

    private function filename(UploadedFile $image): string
    {
        return sprintf('%s-%s.%s', now()->format('YmdHis'), str()->random(8), $image->getClientOriginalExtension() ?: 'jpg');
    }
}
