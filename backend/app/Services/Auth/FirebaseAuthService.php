<?php

namespace App\Services\Auth;

use App\Contracts\Services\FirebaseAuthServiceInterface;
use App\Enums\ActivityType;
use App\Exceptions\ApiException;
use App\Models\User;
use App\Services\ActivityLog\ActivityLogService;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Contract\Auth as FirebaseAuth;
use Throwable;

class FirebaseAuthService implements FirebaseAuthServiceInterface
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function enabled(): bool
    {
        return (bool) config('firebase.auth.enabled')
            && (bool) (config('firebase.credentials_file') || config('firebase.credentials_json'));
    }

    public function verifyIdToken(string $idToken): array
    {
        if (! $this->enabled()) {
            throw new ApiException('Firebase authentication is not enabled.', 503, errorCode: 'firebase_disabled');
        }

        try {
            $verifiedToken = app(FirebaseAuth::class)->verifyIdToken($idToken);
        } catch (Throwable $e) {
            Log::warning('Firebase ID token verification failed', [
                'error' => $e->getMessage(),
            ]);

            throw new ApiException('Invalid Firebase ID token.', 401, errorCode: 'invalid_firebase_token');
        }

        $claims = $verifiedToken->claims()->all();

        return [
            'uid' => $claims['sub'] ?? null,
            'email' => $claims['email'] ?? null,
            'email_verified' => $claims['email_verified'] ?? false,
            'name' => $claims['name'] ?? null,
            'phone' => $claims['phone_number'] ?? null,
            'picture' => $claims['picture'] ?? null,
        ];
    }

    public function findOrCreateUser(array $firebaseUser, array $attributes = []): User
    {
        $uid = $firebaseUser['uid'];

        if ($uid === null) {
            throw new ApiException('Firebase user is missing a UID.', 401, errorCode: 'invalid_firebase_user');
        }

        $user = User::findByFirebaseUid($uid);

        if ($user) {
            return $user;
        }

        $email = $firebaseUser['email'] ?? null;
        $emailVerified = (bool) ($firebaseUser['email_verified'] ?? false);

        $user = User::query()->whereNotNull('email')->where('email', $email)->first();

        $wasExisting = $user !== null;

        if (! $user) {
            $user = new User;
            $user->email = $email;
        }

        $user->firebase_uid = $uid;
        $user->name = $firebaseUser['name'] ?? $user->name ?? 'User';
        $user->phone ??= $firebaseUser['phone'] ?? null;
        $user->password ??= null;

        if ($emailVerified) {
            $user->email_verified_at ??= now();
        }

        $user->fill(array_intersect_key($attributes, array_flip($user->getFillable())));
        $user->save();

        if (! $wasExisting) {
            $user->assignRole(config('api.defaults.user_role', 'student'));
            $this->activityLog->record(
                subject: $user,
                type: ActivityType::REGISTERED,
                causer: $user,
                description: 'registered via Firebase',
            );
        }

        return $user;
    }
}
