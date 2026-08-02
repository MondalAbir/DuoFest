<?php

namespace App\Http\Controllers\Api\Analytics;

use App\Contracts\Services\AnalyticsServiceInterface;
use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends ApiController
{
    public function __construct(
        private readonly AnalyticsServiceInterface $analyticsService,
    ) {}

    /**
     * Aggregate platform-wide metrics for dashboard widgets.
     */
    public function dashboard(): JsonResponse
    {
        return $this->success($this->analyticsService->dashboard(), 'Analytics loaded.');
    }
}
