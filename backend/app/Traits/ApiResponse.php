<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

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
     * Paginated resource wrapper with meta information.
     */
    protected function paginated(mixed $resource, string $message = 'OK'): JsonResponse
    {
        return $this->success($resource, $message, 200);
    }
}
