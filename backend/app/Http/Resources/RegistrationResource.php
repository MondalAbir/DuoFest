<?php

namespace App\Http\Resources;

use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Registration */
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
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'ticket_number' => $this->ticket_number,
            'status' => $this->status?->value ?? $this->status,
            'attendee_details' => $this->attendee_details,
            'ticket_issued_at' => $this->ticket_issued_at?->toISOString(),
            'ticket_qr_url' => $this->when($this->hasIssuedTicket(), $this->ticket_qr_url),
            'ticket_pdf_url' => $this->when($this->hasIssuedTicket(), $this->ticket_pdf_url),
            'checked_in_at' => $this->checked_in_at?->toISOString(),
            'checked_in_by' => $this->checked_in_by,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
