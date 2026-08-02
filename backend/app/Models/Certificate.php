<?php

namespace App\Models;

use App\Concerns\HasUuid;
use App\Enums\CertificateStatus;
use App\Traits\LogsActivity;
use Database\Factories\CertificateFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Certificate extends Model
{
    use HasFactory;
    use HasUuid;
    use LogsActivity;
    use SoftDeletes;

    /** @use CertificateFactory<Factory> */
    protected $fillable = [
        'registration_id',
        'user_id',
        'certificate_number',
        'template',
        'file_path',
        'status',
        'issued_at',
        'expires_at',
        'emailed_at',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
            'expires_at' => 'datetime',
            'emailed_at' => 'datetime',
            'status' => CertificateStatus::class,
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Certificate $certificate) {
            $certificate->certificate_number ??= static::generateCertificateNumber();
            $certificate->issued_at ??= now();
        });
    }

    public static function generateCertificateNumber(): string
    {
        return 'CERT-'.strtoupper(Str::random(10));
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function event(): HasOneThrough
    {
        return $this->hasOneThrough(
            Event::class,
            Registration::class,
            'id',       // Foreign key on registrations
            'id',       // Foreign key on events
            'registration_id',
            'event_id',
        );
    }

    public function hasFile(): bool
    {
        return $this->file_path !== null;
    }

    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? Storage::disk('public')->url($this->file_path) : null;
    }

    public function contactEmail(): ?string
    {
        return $this->registration?->contactEmail() ?? $this->user?->email;
    }
}
