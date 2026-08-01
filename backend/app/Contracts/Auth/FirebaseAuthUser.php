<?php

namespace App\Contracts\Auth;

/**
 * Contract for the authenticatable model backing the "firebase" guard.
 */
interface FirebaseAuthUser
{
    /**
     * Find a user by their Firebase Auth UID.
     *
     * @return static|null
     */
    public static function findByFirebaseUid(string $uid);

    /**
     * Retrieve the Firebase Auth UID for this user.
     */
    public function getFirebaseUid(): ?string;
}
