<?php

namespace App\Models;

use App\Concerns\HasUuid;
use App\Enums\SponsorTier;
use App\Traits\LogsActivity;
use Database\Factories\EventSponsorFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventSponsor extends Model
{
    use HasFactory;
    use HasUuid;
    use LogsActivity;

    /** @use EventSponsorFactory<Factory> */
    protected $fillable = [
        'event_id',
        'name',
        'logo_url',
        'website_url',
        'tier',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'tier' => SponsorTier::class,
            'sort_order' => 'integer',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
