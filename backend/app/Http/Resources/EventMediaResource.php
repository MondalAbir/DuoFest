<?php

namespace App\Http\Resources;

use App\Models\EventMedia;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin EventMedia */
class EventMediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_id' => $this->event_id,
            'type' => $this->type?->value ?? $this->type,
            'url' => $this->url,
            'alt_text' => $this->alt_text,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
