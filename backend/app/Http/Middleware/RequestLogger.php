<?php

namespace App\Http\Middleware;

use App\Enums\ActivityType;
use App\Models\ActivityLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Records a lightweight entry in the activity log for every API request,
 * except for routes excluded via config/activity-log.php.
 */
class RequestLogger
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! config('activity-log.enabled') || ! config('activity-log.log_requests')) {
            return $response;
        }

        if (! $request->is('api/*')) {
            return $response;
        }

        if ($this->isExcluded($request->path())) {
            return $response;
        }

        try {
            ActivityLog::query()->create([
                'type' => ActivityType::REQUEST->value,
                'description' => sprintf('%s %s -> %s', $request->method(), $request->fullUrl(), $response->getStatusCode()),
                'subject_type' => $request->user() ? $request->user()->getMorphClass() : null,
                'subject_id' => $request->user()?->getKey(),
                'causer_id' => $request->user()?->getKey(),
                'causer_type' => $request->user() ? $request->user()->getMorphClass() : null,
                'properties' => [
                    'method' => $request->method(),
                    'path' => $request->path(),
                    'status' => $response->getStatusCode(),
                ],
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 255) ?: null,
            ]);
        } catch (\Throwable) {
            // Never break the request because logging failed.
        }

        return $response;
    }

    protected function isExcluded(string $path): bool
    {
        foreach ((array) config('activity-log.exclude_requests', []) as $pattern) {
            if (fnmatch($pattern, $path) || str_starts_with($path, $pattern)) {
                return true;
            }
        }

        return false;
    }
}
