<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Registration */
class RegistrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_id' => $this->event_id,
            'event' => new EventResource($this->whenLoaded('event')),
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'ticket_number' => $this->ticket_number,
            'status' => $this->status?->value ?? $this->status,
            'attendee_details' => $this->attendee_details,
            'checked_in_at' => $this->checked_in_at?->toISOString(),
            'checked_in_by' => $this->checked_in_by,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
