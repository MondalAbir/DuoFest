<?php

namespace App\Models;

use App\Concerns\HasUuid;
use App\Enums\AttendanceStatus;
use Database\Factories\AttendanceFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;
    use HasUuid;

    /** @use AttendanceFactory<Factory> */
    protected $fillable = [
        'event_id',
        'user_id',
        'registration_id',
        'checked_in_by',
        'attended_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'attended_at' => 'datetime',
            'status' => AttendanceStatus::class,
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

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }

    public function checkedInBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_in_by');
    }
}
