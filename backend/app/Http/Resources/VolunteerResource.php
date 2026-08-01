<?php

namespace App\Http\Resources;

use App\Models\Volunteer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Volunteer */
class VolunteerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'event_id' => $this->event_id,
            'event' => new EventResource($this->whenLoaded('event')),
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'assigned_by' => $this->assigned_by,
            'role' => $this->role,
            'shift_start_at' => $this->shift_start_at?->toISOString(),
            'shift_end_at' => $this->shift_end_at?->toISOString(),
            'hours_volunteered' => (float) $this->hours_volunteered,
            'status' => $this->status?->value,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
