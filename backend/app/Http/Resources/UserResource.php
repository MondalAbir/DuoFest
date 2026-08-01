<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'phone' => $this->phone,
            'college_id' => $this->college_id,
            'college' => new CollegeResource($this->whenLoaded('college')),
            'roles' => $this->whenLoaded('roles', fn () => $this->getRoleNames()),
            'is_active' => $this->is_active,
            'last_seen_at' => $this->last_seen_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
