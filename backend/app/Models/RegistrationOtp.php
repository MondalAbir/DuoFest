<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Database\Factories\RegistrationOtpFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Hash;

class RegistrationOtp extends Model
{
    use HasFactory;
    use HasUuid;

    /** @use RegistrationOtpFactory<Factory> */
    protected $fillable = [
        'event_id',
        'email',
        'name',
        'phone',
        'attendee_details',
        'otp_hash',
        'expires_at',
        'consumed_at',
    ];

    protected function casts(): array
    {
        return [
            'attendee_details' => 'array',
            'expires_at' => 'datetime',
            'consumed_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isConsumed(): bool
    {
        return $this->consumed_at !== null;
    }

    public function check(string $otp): bool
    {
        return Hash::check($otp, $this->otp_hash);
    }

    public function consume(): void
    {
        $this->forceFill(['consumed_at' => now()])->save();
    }
}
