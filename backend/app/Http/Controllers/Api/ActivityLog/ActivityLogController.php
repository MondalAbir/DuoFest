<?php

namespace App\Http\Controllers\Api\ActivityLog;

use App\Enums\Permission;
use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize(Permission::ACTIVITY_LOG_VIEW_ANY->value);

        $logs = ActivityLog::query()
            ->with('subject')
            ->when($request->filled('type'), fn ($query) => $query->where('type', $request->query('type')))
            ->when($request->filled('user_id'), fn ($query) => $query->where('causer_id', $request->query('user_id')))
            ->when($request->filled('subject_type'), fn ($query) => $query->where('subject_type', $request->query('subject_type')))
            ->when($request->filled('subject_id'), fn ($query) => $query->where('subject_id', $request->query('subject_id')))
            ->orderByDesc('created_at')
            ->paginate((int) ($request->query('per_page', config('api.per_page'))));

        return $this->paginated(ActivityLogResource::collection($logs));
    }
}
