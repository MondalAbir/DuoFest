<?php

namespace App\Models;

use App\Concerns\HasUuid;
use App\Enums\RegistrationStatus;
use App\Traits\LogsActivity;
use Database\Factories\RegistrationFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Registration extends Model
{
    use HasFactory;
    use HasUuid;
    use LogsActivity;

    /** @use RegistrationFactory<Factory> */
    protected $fillable = [
        'event_id',
        'user_id',
        'ticket_number',
        'status',
        'attendee_details',
        'name',
        'email',
        'phone',
        'ticket_payload',
        'ticket_qr_path',
        'ticket_pdf_path',
        'ticket_issued_at',
        'checked_in_at',
        'checked_in_by',
    ];

    protected function casts(): array
    {
        return [
            'attendee_details' => 'array',
            'ticket_issued_at' => 'datetime',
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

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    public function attendance(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function isGuest(): bool
    {
        return $this->user_id === null;
    }

    public function hasIssuedTicket(): bool
    {
        return $this->ticket_issued_at !== null && $this->ticket_qr_path !== null;
    }

    public function getTicketQrUrlAttribute(): ?string
    {
        return $this->ticket_qr_path ? Storage::disk('public')->url($this->ticket_qr_path) : null;
    }

    public function getTicketPdfUrlAttribute(): ?string
    {
        return $this->ticket_pdf_path ? Storage::disk('public')->url($this->ticket_pdf_path) : null;
    }

    /**
     * Public identity used for lookups: guest email or the linked account email.
     */
    public function contactEmail(): ?string
    {
        return $this->email ?? $this->user?->email;
    }
}
