<?php

namespace App\Http\Controllers\Api\Auth;

use App\Contracts\Services\AuthServiceInterface;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\FirebaseLoginRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Http\Resources\AuthUserResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends ApiController
{
    public function __construct(
        private readonly AuthServiceInterface $authService,
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        return $this->success(
            new AuthUserResource($result['user'], $result['token'], $result['expires_at'] ?? null),
            'Signed in successfully.',
        );
    }

    public function loginWithFirebase(FirebaseLoginRequest $request): JsonResponse
    {
        $result = $this->authService->loginWithFirebase($request->validated());

        return $this->success(
            new AuthUserResource($result['user'], $result['token'], $result['expires_at'] ?? null),
            'Signed in successfully.',
        );
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()->load(['college', 'roles'])), 'Profile retrieved.');
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request);

        return $this->success(null, 'Signed out successfully.');
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $this->authService->logoutAll($request->user());

        return $this->success(null, 'All sessions signed out.');
    }

    public function resendVerificationEmail(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return $this->success(null, 'Email is already verified.');
        }

        $this->authService->sendEmailVerification($user);

        return $this->success(null, 'Verification email sent.');
    }

    public function verifyEmail(VerifyEmailRequest $request): JsonResponse
    {
        $this->authService->verifyEmail(
            $request->user(),
            (string) $request->validated('expires'),
            $request->validated('signature'),
        );

        return $this->success(['verified' => true], 'Email verified successfully.');
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->sendPasswordResetLink($request->validated('email'));

        return $this->success(null, 'If that email exists, a password reset link has been sent.');
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $this->authService->resetPassword($request->validated());

        return $this->success(null, 'Your password has been reset.');
    }

    /**
     * Accept a college admin invitation by setting an initial password.
     * Reuses the password broker token issued in the invitation email.
     */
    public function acceptInvitation(ResetPasswordRequest $request): JsonResponse
    {
        $this->authService->resetPassword($request->validated());

        return $this->success(null, 'Invitation accepted. You can now sign in.');
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->authService->changePassword($request->user(), $request->validated());

        return $this->success(null, 'Password changed successfully.');
    }
}
