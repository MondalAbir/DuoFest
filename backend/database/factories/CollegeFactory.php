<?php

namespace Database\Factories;

use App\Models\College;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<College>
 */
class CollegeFactory extends Factory
{
    protected $model = College::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company(),
            'code' => strtoupper(fake()->unique()->bothify('??##')),
            'description' => fake()->sentence(),
            'address' => fake()->address(),
            'city' => fake()->city(),
            'country' => 'India',
            'is_active' => true,
        ];
    }
}
