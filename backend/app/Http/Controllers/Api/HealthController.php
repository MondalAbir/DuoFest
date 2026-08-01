<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;

class HealthController extends ApiController
{
    public function __invoke(): JsonResponse
    {
        return $this->success([
            'status' => 'ok',
            'app' => config('app.name'),
            'version' => config('api.version'),
            'timestamp' => now()->toISOString(),
        ], 'Healthy.');
    }
}
