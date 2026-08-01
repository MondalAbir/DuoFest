<?php

namespace App\Traits;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Consistent JSON response envelope for the REST API:
 *
 *   {
 *     "success": true,
 *     "message": "...",
 *     "data": { ... }
 *   }
 */
trait ApiResponse
{
    protected function success(
        mixed $data = null,
        string $message = 'OK',
        int $status = 200,
        array $headers = [],
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status, $headers);
    }

    protected function created(mixed $data = null, string $message = 'Created successfully'): JsonResponse
    {
        return $this->success($data, $message, 201);
    }

    protected function noContent(string $message = 'No content'): JsonResponse
    {
        return $this->success(null, $message, 204);
    }

    protected function error(
        string $message = 'Something went wrong',
        int $status = 400,
        mixed $errors = null,
        array $headers = [],
    ): JsonResponse {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status, $headers);
    }

    /**
     * Paginated resource wrapper. The items are returned under `data` and
     * pagination metadata (total, per page, pages) under `meta`.
     */
    protected function paginated(mixed $resource, string $message = 'OK'): JsonResponse
    {
        $payload = [
            'success' => true,
            'message' => $message,
            'data' => $resource,
        ];

        if ($resource instanceof AnonymousResourceCollection && $resource->resource instanceof LengthAwarePaginator) {
            $paginator = $resource->resource;

            $payload['meta'] = [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ];
        }

        return response()->json($payload, 200);
    }
}
