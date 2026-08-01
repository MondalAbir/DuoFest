<?php

namespace App\Http\Controllers\Api\Auth;

use App\Exceptions\ApiException;
use App\Http\Controllers\Api\ApiController;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Handles direct clicks on the signed email-verification link
 * (named route "verification.verify").
 */
class EmailVerificationController extends ApiController
{
    public function verify(Request $request, int $id, string $hash): JsonResponse
    {
        $user = User::query()->findOrFail($id);

        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            throw new ApiException('Invalid verification link.', 403, errorCode: 'invalid_signature');
        }

        if (! $request->hasValidSignature()) {
            throw new ApiException('Invalid or expired verification link.', 401, errorCode: 'invalid_signature');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return $this->success([
            'verified' => true,
            'email' => $user->email,
        ], 'Email verified successfully.');
    }
}
