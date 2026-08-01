<?php

namespace Tests\Feature;

use App\Contracts\Services\FirebaseAuthServiceInterface;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_create_user(): void
    {
        $admin = $this->createUser([], UserRole::SUPER_ADMIN->value);

        $response = $this->actingAsApi($admin)->postJson('/api/v1/users', [
            'name' => 'College Admin',
            'email' => 'college.admin@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => UserRole::COLLEGE_ADMIN->value,
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'college.admin@example.com')
            ->assertJsonPath('data.roles', [UserRole::COLLEGE_ADMIN->value]);

        $created = User::query()->where('email', 'college.admin@example.com')->first();
        $this->assertNotNull($created);
        $this->assertTrue($created->hasRole(UserRole::COLLEGE_ADMIN->value));
        $this->assertNotNull($created->password);
    }

    public function test_non_super_admin_cannot_create_user(): void
    {
        $student = $this->createUser();

        $this->actingAsApi($student)
            ->postJson('/api/v1/users', [
                'name' => 'Nope',
                'email' => 'nope@example.com',
                'password' => 'secret123',
                'password_confirmation' => 'secret123',
                'role' => UserRole::COLLEGE_ADMIN->value,
            ])->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_create_user(): void
    {
        $this->postJson('/api/v1/users', [
            'name' => 'Nope',
            'email' => 'nope@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => UserRole::COLLEGE_ADMIN->value,
        ])->assertUnauthorized();
    }

    public function test_user_creation_validates_input(): void
    {
        $admin = $this->createUser([], UserRole::SUPER_ADMIN->value);

        $this->actingAsApi($admin)
            ->postJson('/api/v1/users', [
                'name' => '',
                'email' => 'not-an-email',
                'password' => 'short',
                'role' => 'not_a_role',
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

    public function test_otp_only_account_cannot_login_with_password(): void
    {
        User::factory()->create([
            'email' => 'otp-only@example.com',
            'password' => null,
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'otp-only@example.com',
            'password' => 'whatever',
        ])->assertUnprocessable()
            ->assertJsonPath('code', 'otp_only_account');
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

    public function test_user_can_change_password(): void
    {
        $user = $this->createUser(['email' => 'change@example.com']);

        $this->withToken($user->createToken('test')->plainTextToken)
            ->postJson('/api/v1/auth/password/change', [
                'current_password' => 'password',
                'password' => 'newsecret123',
                'password_confirmation' => 'newsecret123',
            ])->assertOk()
            ->assertJsonPath('success', true);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'change@example.com',
            'password' => 'password',
        ])->assertUnauthorized();

        $this->postJson('/api/v1/auth/login', [
            'email' => 'change@example.com',
            'password' => 'newsecret123',
        ])->assertOk();
    }

    public function test_change_password_requires_correct_current_password(): void
    {
        $user = $this->createUser();

        $this->withToken($user->createToken('test')->plainTextToken)
            ->postJson('/api/v1/auth/password/change', [
                'current_password' => 'wrong',
                'password' => 'newsecret123',
                'password_confirmation' => 'newsecret123',
            ])->assertUnprocessable()
            ->assertJsonPath('code', 'invalid_current_password');
    }

    public function test_otp_only_account_cannot_change_password(): void
    {
        $user = User::factory()->create([
            'email' => 'otp-change@example.com',
            'password' => null,
        ]);

        $this->withToken($user->createToken('test')->plainTextToken)
            ->postJson('/api/v1/auth/password/change', [
                'current_password' => 'whatever',
                'password' => 'newsecret123',
                'password_confirmation' => 'newsecret123',
            ])->assertUnprocessable()
            ->assertJsonPath('code', 'otp_only_account');
    }

    public function test_user_can_sign_in_with_firebase_otp(): void
    {
        $this->mock(FirebaseAuthServiceInterface::class, function (MockInterface $mock) {
            $mock->shouldReceive('verifyIdToken')
                ->once()
                ->with('valid.id.token')
                ->andReturn([
                    'uid' => 'firebase-uid-1',
                    'email' => 'otp@example.com',
                    'email_verified' => true,
                    'name' => 'OTP Student',
                ]);

            $mock->shouldReceive('findOrCreateUser')
                ->once()
                ->andReturn(
                    User::factory()->create([
                        'email' => 'otp@example.com',
                        'firebase_uid' => 'firebase-uid-1',
                        'password' => null,
                        'email_verified_at' => now(),
                    ])
                );
        });

        $response = $this->postJson('/api/v1/auth/firebase', [
            'id_token' => 'valid.id.token',
            'name' => 'OTP Student',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.user.email', 'otp@example.com')
            ->assertJsonStructure(['data' => ['user', 'token', 'permissions']]);
    }
}
