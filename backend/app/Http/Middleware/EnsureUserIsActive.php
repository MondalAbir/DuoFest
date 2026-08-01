<?php

namespace App\Http\Middleware;

use App\Exceptions\ApiException;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Rejects requests from blocked or deactivated users.
 */
class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isBlocked()) {
            throw new ApiException('Your account has been blocked.', 403, errorCode: 'account_blocked');
        }

        return $next($request);
    }
}
