<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class VolunteerSlot extends Model
{
    use HasFactory;
    use SoftDeletes;

    /** @use \Database\Factories\VolunteerSlotFactory<\Illuminate\Database\Eloquent\Factories\Factory> */
    protected $fillable = [
        'event_id',
        'name',
        'starts_at',
        'ends_at',
        'capacity',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'capacity' => 'integer',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function volunteers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'volunteer_slot_user')
            ->withPivot(['status'])
            ->withTimestamps();
    }
}
