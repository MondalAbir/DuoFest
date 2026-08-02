<?php

namespace App\Http\Resources;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Attendance */
class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $registration = $this->registration;

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'event_id' => $this->event_id,
            'event' => new EventResource($this->whenLoaded('event')),
            'registration_id' => $this->registration_id,
            'registration' => new RegistrationResource($this->whenLoaded('registration')),
            'user_id' => $this->user_id,
            'attendee' => [
                'name' => $registration?->name ?? $this->user?->name,
                'email' => $registration?->contactEmail() ?? $this->user?->email,
            ],
            'ticket_number' => $registration?->ticket_number,
            'checked_in_by' => $this->checked_in_by,
            'attended_at' => $this->attended_at?->toISOString(),
            'status' => $this->status?->value ?? $this->status,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
