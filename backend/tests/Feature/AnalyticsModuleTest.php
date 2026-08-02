<?php

namespace Tests\Feature;

use App\Enums\PaymentStatus;
use App\Enums\RegistrationStatus;
use App\Enums\UserRole;
use App\Models\College;
use App\Models\Event;
use App\Models\Registration;
use App\Models\Transaction;
use App\Models\User;
use Tests\TestCase;

class AnalyticsModuleTest extends TestCase
{
    private function manager(): User
    {
        return $this->createUser([], UserRole::EVENT_MANAGER->value);
    }

    public function test_guest_cannot_access_analytics(): void
    {
        $this->getJson('/api/v1/analytics/dashboard')
            ->assertUnauthorized();
    }

    public function test_volunteer_without_report_permission_is_forbidden(): void
    {
        $this->actingAsApi($this->createUser([], UserRole::VOLUNTEER->value))
            ->getJson('/api/v1/analytics/dashboard')
            ->assertForbidden();
    }

    public function test_dashboard_returns_expected_structure(): void
    {
        $this->actingAsApi($this->manager())
            ->getJson('/api/v1/analytics/dashboard')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.stats.total_colleges', 0)
            ->assertJsonStructure([
                'data' => [
                    'stats' => ['total_colleges', 'active_colleges', 'total_events', 'total_users', 'total_students', 'total_registrations', 'total_revenue'],
                    'deltas' => ['total_colleges', 'total_revenue'],
                    'registration_trends' => ['today', 'week', 'month', 'year'],
                    'revenue_breakdown',
                    'college_growth',
                ],
            ]);
    }

    public function test_dashboard_aggregates_platform_metrics(): void
    {
        $college = College::factory()->create();
        $event = Event::factory()->published()->create(['college_id' => $college->id]);

        $this->createUser(['college_id' => $college->id], UserRole::STUDENT->value);
        $this->createUser(['college_id' => $college->id], UserRole::STUDENT->value);

        $registration = Registration::factory()->create([
            'event_id' => $event->id,
            'status' => RegistrationStatus::CONFIRMED->value,
        ]);

        Transaction::factory()->forRegistration($registration)->create([
            'amount' => 50.00,
            'payment_method' => 'card',
            'status' => PaymentStatus::COMPLETED->value,
            'paid_at' => now(),
        ]);
        Transaction::factory()->forRegistration($registration)->create([
            'amount' => 30.00,
            'payment_method' => 'cash',
            'status' => PaymentStatus::COMPLETED->value,
            'paid_at' => now(),
        ]);
        Transaction::factory()->forRegistration($registration)->create([
            'amount' => 999.00,
            'status' => PaymentStatus::PENDING->value,
        ]);

        $this->actingAsApi($this->manager())
            ->getJson('/api/v1/analytics/dashboard')
            ->assertOk()
            ->assertJsonPath('data.stats.total_colleges', 1)
            ->assertJsonPath('data.stats.active_colleges', 1)
            ->assertJsonPath('data.stats.total_events', 1)
            ->assertJsonPath('data.stats.total_students', 2)
            ->assertJsonPath('data.stats.total_registrations', 1)
            ->assertJsonPath('data.stats.total_revenue', 80)
            ->assertJsonPath('data.revenue_breakdown.0.name', 'Card')
            ->assertJsonPath('data.revenue_breakdown.0.value', 50)
            ->assertJsonPath('data.revenue_breakdown.1.name', 'Cash')
            ->assertJsonPath('data.revenue_breakdown.1.value', 30);
    }

    public function test_registration_trends_bucket_recent_registrations(): void
    {
        $event = Event::factory()->published()->create();

        Registration::factory()->create(['event_id' => $event->id, 'created_at' => now()]);
        Registration::factory()->create(['event_id' => $event->id, 'created_at' => now()->subHours(2)]);
        Registration::factory()->create(['event_id' => $event->id, 'created_at' => now()->subDays(10)]);

        $response = $this->actingAsApi($this->manager())
            ->getJson('/api/v1/analytics/dashboard')
            ->assertOk();

        $today = collect($response->json('data.registration_trends.today'));
        $this->assertSame(2, (int) $today->sum('value'));

        $month = collect($response->json('data.registration_trends.month'));
        $this->assertSame(3, (int) $month->sum('value'));
    }

    public function test_college_growth_buckets_colleges_and_students_by_month(): void
    {
        $college = College::factory()->create(['created_at' => now()->subMonths(2)]);
        $this->createUser(['college_id' => $college->id, 'created_at' => now()->subMonths(2)], UserRole::STUDENT->value);
        $this->createUser(['college_id' => $college->id, 'created_at' => now()->subMonths(2)], UserRole::STUDENT->value);

        $this->actingAsApi($this->manager())
            ->getJson('/api/v1/analytics/dashboard')
            ->assertOk()
            ->assertJsonPath('data.college_growth.3.colleges', 1)
            ->assertJsonPath('data.college_growth.3.students', 2);
    }
}
