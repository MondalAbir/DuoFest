<?php

namespace App\Http\Controllers\Api\Event;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\EventCategoryResource;
use App\Models\EventCategory;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventCategoryController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $categories = EventCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate((int) ($request->query('per_page', config('api.per_page'))));

        return $this->paginated(EventCategoryResource::collection($categories));
    }

    public function show(EventCategory $category): JsonResponse
    {
        if (! $category->is_active) {
            throw new ModelNotFoundException;
        }

        return $this->success(new EventCategoryResource($category));
    }
}
