<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['user', 'token', 'permissions']]);

        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
        $this->assertDatabaseHas('model_has_roles', [
            'model_type' => User::class,
            'model_id' => User::query()->where('email', 'new@example.com')->first()->id,
        ]);
    }

    public function test_registration_validates_input(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
        ])->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['errors']);
    }

    public function test_user_can_login_and_fetch_profile(): void
    {
        $user = $this->createUser(['email' => 'login@example.com']);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'login@example.com',
            'password' => 'password',
        ]);

        $login->assertOk()
            ->assertJsonPath('data.user.email', 'login@example.com')
            ->assertJsonPath('data.user.roles', [UserRole::STUDENT->value]);

        $token = $login->json('data.token');
        $this->assertNotEmpty($token);

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'login@example.com');
    }

    public function test_login_with_invalid_credentials_fails(): void
    {
        $this->createUser(['email' => 'who@example.com']);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'who@example.com',
            'password' => 'wrong-password',
        ])->assertUnauthorized()
            ->assertJsonPath('code', 'invalid_credentials');
    }

    public function test_blocked_user_cannot_login(): void
    {
        $user = $this->createUser(['email' => 'blocked@example.com']);
        $user->update(['blocked_at' => now()]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'blocked@example.com',
            'password' => 'password',
        ])->assertForbidden()
            ->assertJsonPath('code', 'account_blocked');
    }

    public function test_protected_route_requires_authentication(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_user_can_logout(): void
    {
        $user = $this->createUser();

        $this->withToken($user->createToken('test')->plainTextToken)
            ->postJson('/api/v1/auth/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_user_can_logout_all_sessions(): void
    {
        $user = $this->createUser();
        $user->createToken('a');
        $user->createToken('b');

        $this->actingAsApi($user)
            ->postJson('/api/v1/auth/logout-all')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
