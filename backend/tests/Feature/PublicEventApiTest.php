<?php

namespace Tests\Feature;

use App\Enums\EventStatus;
use App\Models\College;
use App\Models\Event;
use App\Models\EventCategory;
use Tests\TestCase;

class PublicEventApiTest extends TestCase
{
    public function test_public_endpoints_do_not_require_authentication(): void
    {
        Event::factory()->published()->create();

        $this->getJson('/api/v1/events')->assertOk();
        $this->getJson('/api/v1/events/featured')->assertOk();
        $this->getJson('/api/v1/events/upcoming')->assertOk();
        $this->getJson('/api/v1/events/search?q=fest')->assertOk();
        $this->getJson('/api/v1/event-categories')->assertOk();
    }

    public function test_featured_endpoint_returns_only_featured_visible_events(): void
    {
        Event::factory()->published()->create(['is_featured' => true]);
        Event::factory()->published()->create(['is_featured' => false]);
        Event::factory()->create(['is_featured' => true, 'status' => EventStatus::DRAFT->value]);

        $this->getJson('/api/v1/events/featured')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.is_featured', true);
    }

    public function test_upcoming_endpoint_returns_only_future_visible_events(): void
    {
        $this->travelTo(now()->startOfDay());

        $upcoming = Event::factory()->published()->create([
            'starts_at' => now()->addDays(2),
            'ends_at' => now()->addDays(2)->addHours(4),
        ]);
        Event::factory()->published()->create([
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDay(),
        ]);

        $this->getJson('/api/v1/events/upcoming')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $upcoming->id);
    }

    public function test_search_finds_events_by_title_description_and_venue(): void
    {
        Event::factory()->published()->create(['title' => 'Spring Tech Summit']);
        Event::factory()->published()->create(['description' => 'An art exhibition showcase']);
        Event::factory()->published()->create(['venue' => 'Cyber Arena Hall']);
        Event::factory()->published()->create(['title' => 'Unrelated Event']);

        $this->getJson('/api/v1/events/search?q=tech')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Spring Tech Summit');

        $this->getJson('/api/v1/events/search?q=art')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/events/search?q=cyber')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_events_can_be_filtered_by_category_and_college(): void
    {
        $collegeA = College::factory()->create();
        $collegeB = College::factory()->create();
        $category = EventCategory::factory()->create();

        Event::factory()->published()->create([
            'college_id' => $collegeA->id,
            'event_category_id' => $category->id,
        ]);
        Event::factory()->published()->create(['college_id' => $collegeA->id]);
        Event::factory()->published()->create(['college_id' => $collegeB->id]);

        $this->getJson("/api/v1/events?college_id={$collegeA->id}&category_id={$category->id}")
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson("/api/v1/events?college_id={$collegeB->id}")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_event_categories_endpoint_lists_only_active_categories(): void
    {
        EventCategory::factory()->count(3)->create(['is_active' => true]);
        EventCategory::factory()->create(['is_active' => false]);

        $this->getJson('/api/v1/event-categories')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data' => [['id', 'name', 'slug', 'is_active']]]);
    }

    public function test_draft_and_archived_events_are_excluded_from_public_endpoints(): void
    {
        $this->travelTo(now()->startOfDay());

        Event::factory()->create(['status' => EventStatus::DRAFT->value, 'is_featured' => true, 'starts_at' => now()->addWeek()]);
        Event::factory()->create(['status' => EventStatus::ARCHIVED->value, 'starts_at' => now()->addWeek()]);

        $this->getJson('/api/v1/events')->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/events/featured')->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/events/upcoming')->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/events/search?q=a')->assertJsonCount(0, 'data');
    }

    public function test_event_detail_is_only_available_for_visible_events(): void
    {
        $draft = Event::factory()->create(['status' => EventStatus::DRAFT->value]);
        $published = Event::factory()->published()->create();

        $this->getJson("/api/v1/events/{$draft->id}")->assertNotFound();
        $this->getJson("/api/v1/events/slug/{$draft->slug}")->assertNotFound();

        $this->getJson("/api/v1/events/{$published->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $published->id);

        $this->getJson("/api/v1/events/slug/{$published->slug}")
            ->assertOk()
            ->assertJsonPath('data.id', $published->id);
    }

    public function test_public_feed_is_paginated(): void
    {
        Event::factory()->published()->count(12)->create();

        $this->getJson('/api/v1/events?per_page=5')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonStructure([
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ])
            ->assertJsonPath('meta.total', 12)
            ->assertJsonPath('meta.per_page', 5)
            ->assertJsonPath('meta.last_page', 3);
    }
}
