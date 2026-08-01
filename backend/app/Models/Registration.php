<?php

namespace App\Models;

use App\Enums\RegistrationStatus;
use App\Traits\LogsActivity;
use Database\Factories\RegistrationFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Registration extends Model
{
    use HasFactory;
    use LogsActivity;

    /** @use RegistrationFactory<Factory> */
    protected $fillable = [
        'event_id',
        'user_id',
        'ticket_number',
        'status',
        'attendee_details',
        'checked_in_at',
        'checked_in_by',
    ];

    protected function casts(): array
    {
        return [
            'attendee_details' => 'array',
            'checked_in_at' => 'datetime',
            'status' => RegistrationStatus::class,
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Registration $registration) {
            $registration->ticket_number ??= static::generateTicketNumber();
        });
    }

    public static function generateTicketNumber(): string
    {
        return 'DF-'.strtoupper(Str::random(10));
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function checkedInByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_in_by');
    }
}
