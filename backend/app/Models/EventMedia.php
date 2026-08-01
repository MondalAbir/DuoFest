<?php

namespace App\Models;

use App\Concerns\HasUuid;
use App\Enums\EventMediaType;
use App\Traits\LogsActivity;
use Database\Factories\EventMediaFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class EventMedia extends Model
{
    use HasFactory;
    use HasUuid;
    use LogsActivity;

    /** @use EventMediaFactory<Factory> */
    protected $fillable = [
        'event_id',
        'type',
        'file_path',
        'alt_text',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'type' => EventMediaType::class,
            'sort_order' => 'integer',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function getUrlAttribute(): ?string
    {
        return $this->file_path ? Storage::disk('public')->url($this->file_path) : null;
    }
}
