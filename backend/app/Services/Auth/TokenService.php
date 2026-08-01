<?php

namespace App\Services\Auth;

use App\Contracts\Services\TokenServiceInterface;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class TokenService implements TokenServiceInterface
{
    public function create(User $user, string $name = 'duofest', ?array $abilities = null): string
    {
        $abilities ??= $this->defaultAbilities($user);

        $token = $user->createToken($name, $abilities);

        return $token->plainTextToken;
    }

    public function revokeCurrentToken(): void
    {
        $user = Auth::user();
        $tokenId = $user?->currentAccessToken()?->getKey();

        if ($user && $tokenId) {
            $user->tokens()->whereKey($tokenId)->delete();
        }
    }

    public function revokeAllTokens(User $user): void
    {
        $user->tokens()->delete();
    }

    /**
     * Build the Sanctum token abilities from the user's roles and permissions.
     *
     * @return list<string>
     */
    protected function defaultAbilities(User $user): array
    {
        if ($user->isSuperAdmin()) {
            return ['*'];
        }

        return [
            ...array_map(fn ($role) => "role:{$role}", $user->getRoleNames()->all()),
            ...$user->getAllPermissions()->pluck('name')->all(),
        ];
    }
}
