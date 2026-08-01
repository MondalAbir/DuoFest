<?php

namespace App\Services\ActivityLog;

use App\Enums\ActivityType;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class ActivityLogService
{
    /**
     * Persist a single activity log entry.
     *
     * @param  array<string, mixed>|null  $properties
     */
    public function record(
        Model $subject,
        ActivityType $type,
        ?User $causer = null,
        string $description = '',
        ?array $properties = null,
    ): ?ActivityLog {
        if (! config('activity-log.enabled')) {
            return null;
        }

        $request = request();

        try {
            return ActivityLog::query()->create([
                'type' => $type->value,
                'description' => $description,
                'subject_type' => $subject->getMorphClass(),
                'subject_id' => $subject->getKey(),
                'causer_id' => $causer?->getKey(),
                'causer_type' => $causer ? $causer->getMorphClass() : null,
                'properties' => $properties,
                'ip_address' => $request?->ip(),
                'user_agent' => substr((string) $request?->userAgent(), 0, 255) ?: null,
            ]);
        } catch (\Throwable $e) {
            // Activity logging must never break the primary request.
            Log::warning('Failed to record activity log', ['error' => $e->getMessage()]);

            return null;
        }
    }

    public function pruneOlderThan(int $days): int
    {
        return ActivityLog::query()
            ->where('created_at', '<', now()->subDays($days))
            ->delete();
    }
}
