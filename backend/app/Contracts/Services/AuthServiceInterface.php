<?php

namespace App\Contracts\Services;

use App\Models\User;
use Illuminate\Http\Request;

interface AuthServiceInterface
{
    /**
     * Provision a new account for staff/volunteers (admin only).
     *
     * Public student sign-up is intentionally removed; students are
     * auto-registered with the "student" role on their first Firebase
     * email OTP sign-in instead.
     *
     * @param  array<string, mixed>  $data
     */
    public function createUser(array $data): User;

    /**
     * Authenticate an existing user with email/password.
     *
     * @param  array<string, mixed>  $credentials
     * @return array{user: User, token: string, token_type: string}
     */
    public function login(array $credentials): array;

    /**
     * Authenticate a user using a Firebase ID token. Optional profile
     * fields (name, phone, college_id) are applied when the account is
     * auto-created on first sign-in.
     *
     * @param  array<string, mixed>  $data
     * @return array{user: User, token: string, token_type: string}
     */
    public function loginWithFirebase(array $data): array;

    /**
     * Issue a new personal access token for the given user.
     *
     * @return array{token: string, token_type: string, expires_at: string|null}
     */
    public function issueToken(User $user, string $deviceName = 'unknown'): array;

    /**
     * Revoke the current request's access token.
     */
    public function logout(Request $request): void;

    /**
     * Revoke all of the user's tokens.
     */
    public function logoutAll(User $user): void;

    /**
     * Send the email verification notification if not yet verified.
     */
    public function sendEmailVerification(User $user): void;

    /**
     * Verify a user's email using a signed verification request.
     */
    public function verifyEmail(User $user, string $expires, string $signature): void;

    /**
     * Send a password reset link to the given email address.
     */
    public function sendPasswordResetLink(string $email): void;

    /**
     * Reset a user's password with a broker token.
     *
     * @param  array<string, mixed>  $data
     */
    public function resetPassword(array $data): void;

    /**
     * Change the authenticated user's password after verifying their
     * current one. Other sessions are revoked.
     *
     * @param  array<string, mixed>  $data
     */
    public function changePassword(User $user, array $data): void;
}
