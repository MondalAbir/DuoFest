<?php

namespace App\Models;

use App\Enums\EventStatus;
use App\Traits\LogsActivity;
use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Event extends Model
{
    use HasFactory;
    use LogsActivity;
    use SoftDeletes;

    /** @use EventFactory<Factory> */
    protected $attributes = [
        'status' => EventStatus::DRAFT->value,
    ];

    protected $fillable = [
        'college_id',
        'organizer_id',
        'title',
        'slug',
        'description',
        'venue',
        'starts_at',
        'ends_at',
        'status',
        'capacity',
        'registration_count',
        'requires_approval',
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

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function volunteerSlots(): HasMany
    {
        return $this->hasMany(VolunteerSlot::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', EventStatus::PUBLISHED->value);
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('starts_at', '>', now());
    }

    public function scopeForCollege(Builder $query, int $collegeId): Builder
    {
        return $query->where('college_id', $collegeId);
    }
}
