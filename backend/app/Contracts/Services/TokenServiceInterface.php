<?php

namespace App\Contracts\Services;

use App\Models\User;

interface TokenServiceInterface
{
    /**
     * Create a personal access token for the user.
     *
     * @param  array<string, mixed>|null  $abilities
     */
    public function create(User $user, string $name = 'duofest', ?array $abilities = null): string;

    /**
     * Revoke the token used for the current request.
     */
    public function revokeCurrentToken(): void;

    /**
     * Revoke all tokens belonging to the user.
     */
    public function revokeAllTokens(User $user): void;
}
