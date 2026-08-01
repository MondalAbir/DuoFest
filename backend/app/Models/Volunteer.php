<?php

namespace App\Models;

use App\Concerns\HasUuid;
use App\Enums\VolunteerStatus;
use App\Traits\LogsActivity;
use Database\Factories\VolunteerFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Volunteer extends Model
{
    use HasFactory;
    use HasUuid;
    use LogsActivity;

    /** @use VolunteerFactory<Factory> */
    protected $fillable = [
        'event_id',
        'user_id',
        'assigned_by',
        'role',
        'shift_start_at',
        'shift_end_at',
        'hours_volunteered',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'shift_start_at' => 'datetime',
            'shift_end_at' => 'datetime',
            'hours_volunteered' => 'decimal:2',
            'status' => VolunteerStatus::class,
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', [VolunteerStatus::ASSIGNED->value, VolunteerStatus::ACCEPTED->value]);
    }
}
