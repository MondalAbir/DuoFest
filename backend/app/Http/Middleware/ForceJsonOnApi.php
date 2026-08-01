<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Forces the request to be treated as a JSON/API request by setting the
 * Accept header. This keeps exception rendering (401/403/422/429/500)
 * consistent for API routes regardless of client headers.
 */
class ForceJsonOnApi
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('api/*') || $request->is('sanctum/*')) {
            $request->headers->set('Accept', 'application/json');
        }

        return $next($request);
    }
}
