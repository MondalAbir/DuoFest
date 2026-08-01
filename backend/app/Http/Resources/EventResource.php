<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Event */
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
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'venue' => $this->venue,
            'starts_at' => $this->starts_at?->toISOString(),
            'ends_at' => $this->ends_at?->toISOString(),
            'status' => $this->status?->value ?? $this->status,
            'capacity' => $this->capacity,
            'registration_count' => $this->registrations_count ?? $this->registration_count ?? 0,
            'remaining_capacity' => $this->when($this->capacity !== null, function () {
                $count = $this->registrations_count ?? $this->registration_count ?? 0;

                return max(0, $this->capacity - $count);
            }),
            'requires_approval' => $this->requires_approval,
            'is_featured' => $this->is_featured,
            'cover_image_url' => $this->cover_image_url,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
