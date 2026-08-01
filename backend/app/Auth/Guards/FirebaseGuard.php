<?php

namespace App\Auth\Guards;

use App\Contracts\Services\FirebaseAuthServiceInterface;
use Illuminate\Auth\GuardHelpers;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Http\Request;

/**
 * Stateless guard that authenticates a user from a Firebase ID token sent as
 * a bearer token in the Authorization header.
 */
class FirebaseGuard implements Guard
{
    use GuardHelpers;

    public function __construct(
        protected readonly FirebaseAuthServiceInterface $firebaseAuth,
        protected readonly Request $request,
    ) {}

    public function user(): ?Authenticatable
    {
        if ($this->user !== null) {
            return $this->user;
        }

        $idToken = $this->getTokenFromRequest();

        if ($idToken === null) {
            return null;
        }

        try {
            $firebaseUser = $this->firebaseAuth->verifyIdToken($idToken);
        } catch (\Throwable) {
            return null;
        }

        $this->user = $this->firebaseAuth->findOrCreateUser($firebaseUser);

        return $this->user;
    }

    public function validate(array $credentials = []): bool
    {
        return $this->user() !== null;
    }

    protected function getTokenFromRequest(): ?string
    {
        $header = $this->request->header('Authorization', '');

        if (preg_match('/Bearer\s+(.+)/i', $header, $matches) === 1) {
            return $matches[1];
        }

        return $this->request->bearerToken();
    }
}
