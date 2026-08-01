<?php

namespace Database\Seeders;

use App\Models\EventCategory;
use Illuminate\Database\Seeder;

class EventCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Cultural', 'slug' => 'cultural', 'icon' => 'theater-masks', 'color' => '#f97316', 'sort_order' => 1],
            ['name' => 'Technical', 'slug' => 'technical', 'icon' => 'microchip', 'color' => '#3b82f6', 'sort_order' => 2],
            ['name' => 'Sports', 'slug' => 'sports', 'icon' => 'trophy', 'color' => '#22c55e', 'sort_order' => 3],
            ['name' => 'Workshop', 'slug' => 'workshop', 'icon' => 'tools', 'color' => '#a855f7', 'sort_order' => 4],
            ['name' => 'Guest Lecture', 'slug' => 'guest-lecture', 'icon' => 'microphone', 'color' => '#eab308', 'sort_order' => 5],
            ['name' => 'Social', 'slug' => 'social', 'icon' => 'users', 'color' => '#ec4899', 'sort_order' => 6],
        ];

        foreach ($categories as $category) {
            EventCategory::query()->firstOrCreate(
                ['slug' => $category['slug']],
                $category,
            );
        }
    }
}
