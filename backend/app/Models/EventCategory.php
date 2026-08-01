<?php

namespace App\Models;

use App\Concerns\HasUuid;
use App\Traits\LogsActivity;
use Database\Factories\EventCategoryFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class EventCategory extends Model
{
    use HasFactory;
    use HasUuid;
    use LogsActivity;
    use SoftDeletes;

    /** @use EventCategoryFactory<Factory> */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'color',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (EventCategory $category) {
            $category->slug ??= Str::slug($category->name);
        });
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }
}
