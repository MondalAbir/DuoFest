<?php

namespace App\Http\Controllers\Api\User;

use App\Contracts\Services\AuthServiceInterface;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\User\CreateUserRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;

class UserController extends ApiController
{
    public function __construct(
        private readonly AuthServiceInterface $authService,
    ) {}

    /**
     * Provision a staff/volunteer account. Students self-register via
     * Firebase email OTP, so this endpoint is reserved for super admins.
     */
    public function store(CreateUserRequest $request): JsonResponse
    {
        $user = $this->authService->createUser($request->validated());

        return $this->created(
            new UserResource($user->load(['college', 'roles'])),
            'User account created successfully.',
        );
    }
}
