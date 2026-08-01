<?php

namespace App\Http\Resources;

use App\Enums\EventStatus;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Event */
class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'college_id' => $this->college_id,
            'college' => new CollegeResource($this->whenLoaded('college')),
            'organizer_id' => $this->organizer_id,
            'organizer' => new UserResource($this->whenLoaded('organizer')),
            'category_id' => $this->event_category_id,
            'category' => new EventCategoryResource($this->whenLoaded('category')),
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'venue' => $this->venue,
            'starts_at' => $this->starts_at?->toISOString(),
            'ends_at' => $this->ends_at?->toISOString(),
            'status' => $this->status?->value ?? $this->status,
            'phase' => $this->phase(),
            'archived_from' => $this->archived_from,
            'capacity' => $this->capacity,
            'registration_count' => $this->registrations_count ?? $this->registration_count ?? 0,
            'remaining_capacity' => $this->when($this->capacity !== null, function () {
                $count = $this->registrations_count ?? $this->registration_count ?? 0;

                return max(0, $this->capacity - $count);
            }),
            'requires_approval' => $this->requires_approval,
            'registration_enabled' => $this->registration_enabled,
            'registration_open_at' => $this->registration_open_at?->toISOString(),
            'registration_closes_at' => $this->registration_closes_at?->toISOString(),
            'is_featured' => $this->is_featured,
            'cover_image_url' => $this->cover_image_url,
            'banner' => EventMediaResource::collection($this->whenLoaded('banner')),
            'gallery' => EventMediaResource::collection($this->whenLoaded('gallery')),
            'sponsors' => EventSponsorResource::collection($this->whenLoaded('sponsors')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Lifecycle phase derived from the workflow status and schedule.
     */
    private function phase(): string
    {
        $status = $this->status?->value;

        if (in_array($status, [EventStatus::DRAFT->value, EventStatus::ARCHIVED->value, EventStatus::CANCELLED->value], true)) {
            return $status;
        }

        $now = now();

        if ($this->starts_at && $this->starts_at->isFuture()) {
            return 'upcoming';
        }

        if ($this->starts_at && $this->starts_at->lte($now) && ($this->ends_at === null || $this->ends_at->gte($now))) {
            return 'ongoing';
        }

        if ($status === EventStatus::COMPLETED->value || ($this->ends_at && $this->ends_at->lt($now))) {
            return 'completed';
        }

        return $status ?? EventStatus::PUBLISHED->value;
    }
}
