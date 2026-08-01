<?php

namespace App\Traits;

use App\Enums\ActivityType;
use App\Services\ActivityLog\ActivityLogService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

/**
 * Automatically records create/update/delete/restore activity for a model.
 *
 * Usage:
 *   use LogsActivity;
 *
 * Optionally override:
 *   protected function activityLogName(): ?string { return 'Custom name'; }
 */
trait LogsActivity
{
    protected static function bootLogsActivity(): void
    {
        static::created(fn (Model $model) => static::recordActivity($model, ActivityType::CREATED));
        static::updated(fn (Model $model) => static::recordActivity($model, ActivityType::UPDATED));
        static::deleted(fn (Model $model) => static::recordActivity($model, ActivityType::DELETED));

        if (in_array(SoftDeletes::class, class_uses_recursive(static::class), true)) {
            static::restored(fn (Model $model) => static::recordActivity($model, ActivityType::RESTORED));
        }
    }

    protected static function recordActivity(Model $model, ActivityType $type): void
    {
        if (! config('activity-log.enabled')) {
            return;
        }

        $service = app(ActivityLogService::class);

        $service->record(
            subject: $model,
            type: $type,
            causer: Auth::user(),
            description: sprintf(
                '%s %s',
                $type->value,
                $model->getAttribute('name')
                    ?? $model->getAttribute('title')
                    ?? static::activityLogName($model),
            ),
            properties: static::buildProperties($model, $type),
        );
    }

    /**
     * Snapshot of the change payload for created/updated events.
     */
    protected static function buildProperties(Model $model, ActivityType $type): array
    {
        if ($type === ActivityType::DELETED || $type === ActivityType::RESTORED) {
            return $model->getAttributes();
        }

        $changes = $model->getChanges();

        return [
            'changes' => $changes,
            'attributes' => array_intersect_key(
                $model->getAttributes(),
                array_flip(array_keys($changes)),
            ),
        ];
    }

    protected static function activityLogName(Model $model): string
    {
        return class_basename($model);
    }
}
