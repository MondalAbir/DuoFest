<?php

namespace App\Contracts\Services;

interface AnalyticsServiceInterface
{
    /**
     * Aggregate platform-wide metrics for dashboard widgets.
     *
     * @return array{
     *     stats: array<string, float|int>,
     *     deltas: array<string, float>,
     *     registration_trends: array<string, list<array{label: string, value: int}>>,
     *     revenue_breakdown: list<array{name: string, value: float}>,
     *     college_growth: list<array{label: string, colleges: int, students: int}>,
     * }
     */
    public function dashboard(): array;
}
