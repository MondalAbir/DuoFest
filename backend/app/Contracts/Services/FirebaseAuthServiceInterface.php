<?php

namespace App\Contracts\Services;

use App\Models\User;

interface FirebaseAuthServiceInterface
{
    /**
     * Verify a Firebase ID token and return the verified user record.
     *
     * @return array<string, mixed>
     */
    public function verifyIdToken(string $idToken): array;

    /**
     * Find an existing user by Firebase UID or create one from verified data.
     *
     * @param  array<string, mixed>  $firebaseUser  Verified Firebase user record
     * @param  array<string, mixed>  $attributes  Additional attributes to set on creation
     */
    public function findOrCreateUser(array $firebaseUser, array $attributes = []): User;

    /**
     * Whether Firebase authentication is currently enabled.
     */
    public function enabled(): bool;
}
