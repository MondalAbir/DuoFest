<?php

namespace App\Support\Http;

use App\Exceptions\ApiException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\ThrottleRequestsException;
use Throwable;

/**
 * Renders structured JSON errors for API requests. Returns null when the
 * request is not an API request so the framework default handler takes over.
 */
class JsonApiExceptionRenderer
{
    public static function render(Request $request, Throwable $e): ?JsonResponse
    {
        if (! $request->is('api/*')) {
            return null;
        }

        return match (true) {
            $e instanceof ApiException => static::api($e),
            $e instanceof AuthenticationException => static::message(
                $e->getMessage() ?: 'Unauthenticated.',
                401,
            ),
            $e instanceof AuthorizationException => static::message('This action is unauthorized.', 403),
            $e instanceof ValidationException => static::validation($e),
            $e instanceof ModelNotFoundException => static::message('Resource not found.', 404),
            $e instanceof NotFoundHttpException => static::message('Route not found.', 404),
            $e instanceof MethodNotAllowedHttpException => static::message('Method not allowed.', 405),
            $e instanceof ThrottleRequestsException => static::message('Too many requests.', 429),
            $e instanceof HttpException => static::message($e->getMessage(), $e->getStatusCode()),
            default => static::fallback($e),
        };
    }

    protected static function api(ApiException $e): JsonResponse
    {
        $payload = [
            'success' => false,
            'code' => $e->getErrorCode(),
            'message' => $e->getMessage(),
        ];

        if ($e->getErrors() !== null) {
            $payload['errors'] = $e->getErrors();
        }

        return response()->json($payload, $e->getStatusCode(), $e->getHeaders());
    }

    protected static function validation(ValidationException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'code' => 'validation_error',
            'message' => 'The given data was invalid.',
            'errors' => $e->errors(),
        ], 422);
    }

    protected static function message(string $message, int $status): JsonResponse
    {
        return response()->json([
            'success' => false,
            'code' => $status === 401 ? 'unauthenticated' : 'http_error',
            'message' => $message,
        ], $status);
    }

    protected static function fallback(Throwable $e): JsonResponse
    {
        $debug = config('app.debug');

        return response()->json([
            'success' => false,
            'code' => 'server_error',
            'message' => $debug ? $e->getMessage() : 'Server error.',
        ], 500);
    }
}
