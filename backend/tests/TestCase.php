<?php

namespace Tests;

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Hash;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    /**
     * Create a user, optionally with a role assigned.
     */
    protected function createUser(array $attributes = [], string $role = UserRole::STUDENT->value): User
    {
        $user = User::factory()->create(array_merge([
            'password' => Hash::make('password'),
        ], $attributes));

        $user->assignRole($role);

        return $user;
    }

    /**
     * Authenticate as the given user on the "api" guard.
     */
    protected function actingAsApi(User $user): static
    {
        return $this->actingAs($user, 'api');
    }

    /**
     * Issue a real Sanctum token for the user and return Authorization headers.
     *
     * @return array<string, string>
     */
    protected function bearerHeaders(User $user): array
    {
        $token = $user->createToken('test-token')->plainTextToken;

        return ['Authorization' => 'Bearer '.$token];
    }
}
