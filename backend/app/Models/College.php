<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class College extends Model
{
    use HasFactory;
    use SoftDeletes;

    /** @use \Database\Factories\CollegeFactory<\Illuminate\Database\Eloquent\Factories\Factory> */
    protected $fillable = [
        'name',
        'code',
        'description',
        'address',
        'city',
        'country',
        'is_active',
    ];

    protected $attributes = [
        'country' => 'India',
        'is_active' => true,
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }
}
