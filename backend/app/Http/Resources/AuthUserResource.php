<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class AuthUserResource extends JsonResource
{
    /**
     * @param  string|null  $token  Bearer token issued at authentication time.
     * @param  string|null  $tokenExpiresAt
     */
    public function __construct(
        $resource,
        protected readonly ?string $token = null,
        protected readonly ?string $tokenExpiresAt = null,
    ) {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        return [
            'user' => new UserResource($this->resource->loadMissing(['college', 'roles'])),
            'token' => $this->token,
            'token_type' => 'Bearer',
            'expires_at' => $this->tokenExpiresAt,
            'permissions' => $this->resource->getAllPermissions()->pluck('name'),
        ];
    }
}
