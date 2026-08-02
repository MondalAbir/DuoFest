<?php

namespace App\Http\Resources;

use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Certificate */
class CertificateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'registration_id' => $this->registration_id,
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'attendee' => [
                'name' => $this->registration?->name ?? $this->user?->name,
                'email' => $this->contactEmail(),
            ],
            'certificate_number' => $this->certificate_number,
            'template' => $this->template,
            'status' => $this->status?->value ?? $this->status,
            'file_url' => $this->file_url,
            'issued_at' => $this->issued_at?->toISOString(),
            'expires_at' => $this->expires_at?->toISOString(),
            'emailed_at' => $this->emailed_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
