<?php

namespace App\Services\Analytics;

use App\Contracts\Services\AnalyticsServiceInterface;
use App\Enums\EventStatus;
use App\Enums\PaymentStatus;
use App\Enums\RegistrationStatus;
use App\Enums\UserRole;
use App\Enums\VolunteerStatus;
use App\Models\College;
use App\Models\Event;
use App\Models\Registration;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Support\Carbon;

class AnalyticsService implements AnalyticsServiceInterface
{
    private const TREND_PERIODS = ['today', 'week', 'month', 'year'];

    public function dashboard(): array
    {
        $now = Carbon::now();
        $cutoff = $now->copy()->subDays(30);

        $stats = [
            'total_colleges' => College::query()->count(),
            'active_colleges' => College::query()->where('is_active', true)->count(),
            'total_events' => Event::query()->count(),
            'published_events' => Event::query()->where('status', EventStatus::PUBLISHED->value)->count(),
            'total_users' => User::query()->count(),
            'total_students' => User::role(UserRole::STUDENT->value)->count(),
            'total_volunteers' => Volunteer::query()
                ->whereIn('status', [VolunteerStatus::ASSIGNED->value, VolunteerStatus::ACCEPTED->value])
                ->count(),
            'total_registrations' => Registration::query()->count(),
            'total_checked_in' => Registration::query()
                ->where('status', RegistrationStatus::CHECKED_IN->value)
                ->count(),
            'total_revenue' => round((float) Transaction::query()
                ->where('status', PaymentStatus::COMPLETED->value)
                ->sum('amount'), 2),
        ];

        return [
            'stats' => $stats,
            'deltas' => $this->deltas($stats, $cutoff),
            'registration_trends' => $this->registrationTrends($now),
            'revenue_breakdown' => $this->revenueBreakdown(),
            'college_growth' => $this->collegeGrowth($now),
        ];
    }

    /**
     * Percentage change of each stat compared to the 30-day-old baseline.
     *
     * @param  array<string, float|int>  $stats
     * @return array<string, float>
     */
    private function deltas(array $stats, Carbon $cutoff): array
    {
        $previous = [
            'total_colleges' => College::query()->where('created_at', '<', $cutoff)->count(),
            'active_colleges' => College::query()->where('is_active', true)->where('created_at', '<', $cutoff)->count(),
            'total_events' => Event::query()->where('created_at', '<', $cutoff)->count(),
            'total_students' => User::role(UserRole::STUDENT->value)->where('created_at', '<', $cutoff)->count(),
            'total_registrations' => Registration::query()->where('created_at', '<', $cutoff)->count(),
            'total_revenue' => (float) Transaction::query()
                ->where('status', PaymentStatus::COMPLETED->value)
                ->where('paid_at', '<', $cutoff)
                ->sum('amount'),
        ];

        $deltas = [];

        foreach ($previous as $key => $value) {
            $deltas[$key] = $this->deltaPct((float) $stats[$key], (float) $value);
        }

        return $deltas;
    }

    private function deltaPct(float $current, float $previous): float
    {
        if ($previous <= 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round(($current - $previous) / $previous * 100, 1);
    }

    /**
     * @return array<string, list<array{label: string, value: int}>>
     */
    private function registrationTrends(Carbon $now): array
    {
        return [
            'today' => $this->bucketRegistrations($this->hourlyBuckets($now->copy()->startOfDay())),
            'week' => $this->bucketRegistrations($this->dailyBuckets($now->copy()->startOfDay()->subDays(6), 7)),
            'month' => $this->bucketRegistrations($this->dailyBuckets($now->copy()->startOfDay()->subDays(29), 6, 5)),
            'year' => $this->bucketRegistrations($this->monthlyBuckets($now->copy()->startOfYear(), 12)),
        ];
    }

    /**
     * @return list<array{label: string, start: Carbon, end: Carbon}>
     */
    private function hourlyBuckets(Carbon $day): array
    {
        $buckets = [];

        for ($hour = 0; $hour < 24; $hour += 3) {
            $start = $day->copy()->addHours($hour);

            $buckets[] = [
                'label' => $this->hourLabel($hour),
                'start' => $start,
                'end' => $start->copy()->addHours(3),
            ];
        }

        return $buckets;
    }

    private function hourLabel(int $hour): string
    {
        if ($hour === 0) {
            return '12 AM';
        }

        return $hour < 12
            ? $hour.' AM'
            : ($hour === 12 ? '12 PM' : ($hour - 12).' PM');
    }

    /**
     * @return list<array{label: string, start: Carbon, end: Carbon}>
     */
    private function dailyBuckets(Carbon $start, int $count, int $step = 1): array
    {
        $buckets = [];

        for ($i = 0; $i < $count; $i++) {
            $bucketStart = $start->copy()->addDays($i * $step);

            $buckets[] = [
                'label' => $bucketStart->format($step === 1 ? 'D' : 'M j'),
                'start' => $bucketStart,
                'end' => $bucketStart->copy()->addDays($step),
            ];
        }

        return $buckets;
    }

    /**
     * @return list<array{label: string, start: Carbon, end: Carbon}>
     */
    private function monthlyBuckets(Carbon $yearStart, int $count): array
    {
        $buckets = [];

        for ($i = 0; $i < $count; $i++) {
            $start = $yearStart->copy()->addMonths($i);

            $buckets[] = [
                'label' => $start->format('M'),
                'start' => $start,
                'end' => $start->copy()->addMonth(),
            ];
        }

        return $buckets;
    }

    /**
     * @param  list<array{label: string, start: Carbon, end: Carbon}>  $buckets
     * @return list<array{label: string, value: int}>
     */
    private function bucketRegistrations(array $buckets): array
    {
        return array_map(fn (array $bucket) => [
            'label' => $bucket['label'],
            'value' => Registration::query()
                ->whereBetween('created_at', [$bucket['start'], $bucket['end']])
                ->count(),
        ], $buckets);
    }

    /**
     * @return list<array{name: string, value: float}>
     */
    private function revenueBreakdown(): array
    {
        $rows = Transaction::query()
            ->where('status', PaymentStatus::COMPLETED->value)
            ->selectRaw('COALESCE(NULLIF(payment_method, ""), "other") as method, SUM(amount) as total')
            ->groupBy('method')
            ->orderByDesc('total')
            ->get();

        return $rows
            ->map(fn ($row) => [
                'name' => ucwords(str_replace('_', ' ', (string) $row->method)),
                'value' => round((float) $row->total, 2),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{label: string, colleges: int, students: int}>
     */
    private function collegeGrowth(Carbon $now): array
    {
        $growth = [];

        for ($i = 5; $i >= 0; $i--) {
            $start = $now->copy()->startOfMonth()->subMonths($i);
            $end = $start->copy()->addMonth();

            $growth[] = [
                'label' => $start->format('M'),
                'colleges' => College::query()->whereBetween('created_at', [$start, $end])->count(),
                'students' => User::role(UserRole::STUDENT->value)->whereBetween('created_at', [$start, $end])->count(),
            ];
        }

        return $growth;
    }
}
