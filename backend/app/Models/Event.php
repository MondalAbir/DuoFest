<?php

namespace App\Models;

use App\Concerns\HasUuid;
use App\Enums\EventStatus;
use App\Traits\LogsActivity;
use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Event extends Model
{
    use HasFactory;
    use HasUuid;
    use LogsActivity;
    use SoftDeletes;

    /** @use EventFactory<Factory> */
    protected $attributes = [
        'status' => EventStatus::DRAFT->value,
    ];

    protected $fillable = [
        'college_id',
        'organizer_id',
        'event_category_id',
        'title',
        'slug',
        'description',
        'venue',
        'starts_at',
        'ends_at',
        'status',
        'archived_from',
        'capacity',
        'registration_count',
        'requires_approval',
        'registration_enabled',
        'registration_open_at',
        'registration_closes_at',
        'is_featured',
        'cover_image_url',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'capacity' => 'integer',
            'registration_count' => 'integer',
            'requires_approval' => 'boolean',
            'registration_enabled' => 'boolean',
            'registration_open_at' => 'datetime',
            'registration_closes_at' => 'datetime',
            'is_featured' => 'boolean',
            'status' => EventStatus::class,
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Event $event) {
            if (empty($event->slug)) {
                $event->slug = static::uniqueSlug($event->title);
            }
        });
    }

    protected static function uniqueSlug(string $title): string
    {
        $base = Str::slug($title);

        return $base ?: Str::lower(Str::random(8));
    }

    public function college(): BelongsTo
    {
        return $this->belongsTo(College::class);
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(EventCategory::class, 'event_category_id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function volunteers(): HasMany
    {
        return $this->hasMany(Volunteer::class);
    }

    public function attendance(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(Announcement::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(EventMedia::class);
    }

    public function gallery(): HasMany
    {
        return $this->media()->where('type', 'gallery');
    }

    public function banner(): HasMany
    {
        return $this->media()->where('type', 'banner');
    }

    public function sponsors(): HasMany
    {
        return $this->hasMany(EventSponsor::class);
    }

    public function certificates(): HasManyThrough
    {
        return $this->hasManyThrough(Certificate::class, Registration::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', EventStatus::PUBLISHED->value);
    }

    /**
     * Events currently visible to the public (all non-workflow statuses).
     */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->whereIn('status', [
            EventStatus::PUBLISHED->value,
            EventStatus::UPCOMING->value,
            EventStatus::LIVE->value,
        ]);
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('starts_at', '>', now());
    }

    public function scopeOngoing(Builder $query): Builder
    {
        return $query->where('starts_at', '<=', now())
            ->where(function (Builder $query) {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', now());
            });
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where(function (Builder $query) {
            $query->where('status', EventStatus::COMPLETED->value)
                ->orWhere('ends_at', '<', now());
        });
    }

    public function scopeArchived(Builder $query): Builder
    {
        return $query->where('status', EventStatus::ARCHIVED->value);
    }

    public function scopeForCollege(Builder $query, int $collegeId): Builder
    {
        return $query->where('college_id', $collegeId);
    }

    public function isVisible(): bool
    {
        return in_array($this->status?->value, [
            EventStatus::PUBLISHED->value,
            EventStatus::UPCOMING->value,
            EventStatus::LIVE->value,
        ], true);
    }
}
