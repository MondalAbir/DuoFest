<?php

namespace App\Services\Auth;

use App\Contracts\Services\AuthServiceInterface;
use App\Contracts\Services\FirebaseAuthServiceInterface;
use App\Contracts\Services\TokenServiceInterface;
use App\Enums\ActivityType;
use App\Exceptions\ApiException;
use App\Models\User;
use App\Notifications\EmailVerificationNotification;
use App\Services\ActivityLog\ActivityLogService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class AuthService implements AuthServiceInterface
{
    public function __construct(
        private readonly TokenServiceInterface $tokens,
        private readonly FirebaseAuthServiceInterface $firebase,
        private readonly ActivityLogService $activityLog,
    ) {}

    public function createUser(array $data): User
    {
        $user = new User([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
            'college_id' => $data['college_id'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        $user->save();

        $user->assignRole($data['role']);

        $this->activityLog->record(
            subject: $user,
            type: ActivityType::CREATED,
            causer: request()->user(),
            description: "Created {$data['role']} account for {$user->email}",
        );

        return $user;
    }

    public function login(array $credentials): array
    {
        $user = User::query()
            ->where('email', $credentials['email'])
            ->first();

        if (! $user) {
            throw new ApiException('Invalid credentials.', 401, errorCode: 'invalid_credentials');
        }

        if ($user->password === null) {
            throw new ApiException(
                'This account uses email OTP. Please sign in with the verification code.',
                422,
                errorCode: 'otp_only_account',
            );
        }

        if (! Hash::check($credentials['password'], $user->password)) {
            throw new ApiException('Invalid credentials.', 401, errorCode: 'invalid_credentials');
        }

        if ($user->isBlocked()) {
            throw new ApiException('Your account has been blocked.', 403, errorCode: 'account_blocked');
        }

        $this->activityLog->record(
            subject: $user,
            type: ActivityType::LOGIN,
            causer: $user,
            description: "User {$user->email} signed in",
        );

        return $this->tokenPair($user, $credentials['device_name'] ?? 'unknown');
    }

    public function loginWithFirebase(array $data): array
    {
        $firebaseUser = $this->firebase->verifyIdToken($data['id_token']);

        $user = $this->firebase->findOrCreateUser(
            $firebaseUser,
            array_intersect_key($data, array_flip(['name', 'phone', 'college_id'])),
        );

        if ($user->isBlocked()) {
            throw new ApiException('Your account has been blocked.', 403, errorCode: 'account_blocked');
        }

        $this->activityLog->record(
            subject: $user,
            type: ActivityType::LOGIN,
            causer: $user,
            description: "User {$user->email} signed in via Firebase",
        );

        return $this->tokenPair($user, 'firebase');
    }

    public function issueToken(User $user, string $deviceName = 'unknown'): array
    {
        $expiresAt = config('api.token_expiry_days')
            ? now()->addDays(config('api.token_expiry_days'))
            : null;

        $plainToken = $this->tokens->create($user, config('api.token_name', 'duofest'));

        return [
            'token' => $plainToken,
            'token_type' => 'Bearer',
            'expires_at' => $expiresAt?->toISOString(),
        ];
    }

    public function logout(Request $request): void
    {
        $user = $request->user();

        if ($user) {
            $this->activityLog->record(
                subject: $user,
                type: ActivityType::LOGOUT,
                causer: $user,
                description: "User {$user->email} signed out",
            );
        }

        $this->tokens->revokeCurrentToken();
    }

    public function logoutAll(User $user): void
    {
        $this->activityLog->record(
            subject: $user,
            type: ActivityType::LOGOUT,
            causer: $user,
            description: 'All sessions revoked',
        );

        $this->tokens->revokeAllTokens($user);
    }

    public function sendEmailVerification(User $user): void
    {
        if ($user->hasVerifiedEmail()) {
            return;
        }

        $user->notify(new EmailVerificationNotification);
    }

    public function verifyEmail(User $user, string $expires, string $signature): void
    {
        $hash = sha1($user->getEmailForVerification());

        $signedRequest = Request::create(
            route('verification.verify', ['id' => $user->getKey(), 'hash' => $hash]),
            'GET',
            ['expires' => $expires, 'signature' => $signature],
        );

        if (! URL::hasValidSignature($signedRequest)) {
            throw new ApiException('Invalid or expired verification link.', 401, errorCode: 'invalid_signature');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();

            $this->activityLog->record(
                subject: $user,
                type: ActivityType::EMAIL_VERIFIED,
                causer: $user,
                description: "Email verified for {$user->email}",
            );
        }
    }

    public function sendPasswordResetLink(string $email): void
    {
        $status = Password::sendResetLink(['email' => $email]);

        if ($status !== Password::RESET_LINK_SENT) {
            // Do not leak whether an account exists.
            throw new ApiException('Unable to send the password reset link.', 422, errorCode: 'reset_link_failed');
        }
    }

    public function resetPassword(array $data): void
    {
        $status = Password::reset(
            $data,
            function (User $user, string $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();

                $user->setRememberToken(Str::random(60));

                $this->activityLog->record(
                    subject: $user,
                    type: ActivityType::PASSWORD_RESET,
                    causer: $user,
                    description: "Password reset for {$user->email}",
                );

                event(new PasswordReset($user));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw new ApiException('This password reset token is invalid or has expired.', 422, errorCode: 'invalid_reset_token');
        }
    }

    public function changePassword(User $user, array $data): void
    {
        if ($user->password === null) {
            throw new ApiException(
                'This account uses email OTP and has no local password.',
                422,
                errorCode: 'otp_only_account',
            );
        }

        if (! Hash::check($data['current_password'], $user->password)) {
            throw new ApiException('Your current password is incorrect.', 422, errorCode: 'invalid_current_password');
        }

        $user->password = Hash::make($data['password']);
        $user->save();

        // Revoke every other session so the new password takes effect everywhere.
        $user->tokens()
            ->when(
                $currentTokenId = $user->currentAccessToken()?->getKey(),
                fn ($query) => $query->whereKeyNot($currentTokenId),
            )
            ->delete();

        $this->activityLog->record(
            subject: $user,
            type: ActivityType::PASSWORD_CHANGED,
            causer: $user,
            description: "Password changed for {$user->email}",
        );
    }

    /**
     * @return array{user: User, token: string, token_type: string, expires_at: string|null}
     */
    protected function tokenPair(User $user, string $deviceName): array
    {
        $user->markLastSeen();

        return [
            'user' => $user,
            ...$this->issueToken($user, $deviceName),
        ];
    }
}
