<?php

namespace App\Http\Resources;

use App\Models\VolunteerSlot;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin VolunteerSlot */
class VolunteerSlotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_id' => $this->event_id,
            'event' => new EventResource($this->whenLoaded('event')),
            'name' => $this->name,
            'starts_at' => $this->starts_at?->toISOString(),
            'ends_at' => $this->ends_at?->toISOString(),
            'capacity' => $this->capacity,
            'volunteers_count' => $this->whenCounted('volunteers'),
            'volunteers' => UserResource::collection($this->whenLoaded('volunteers')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
