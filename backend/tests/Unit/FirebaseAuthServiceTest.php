<?php

namespace Tests\Unit;

use App\Enums\UserRole;
use App\Models\College;
use App\Models\User;
use App\Services\ActivityLog\ActivityLogService;
use App\Services\Auth\FirebaseAuthService;
use Tests\TestCase;

class FirebaseAuthServiceTest extends TestCase
{
    private FirebaseAuthService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new FirebaseAuthService($this->app->make(ActivityLogService::class));
    }

    public function test_find_or_create_user_auto_registers_student_on_first_otp_sign_in(): void
    {
        $user = $this->service->findOrCreateUser([
            'uid' => 'firebase-uid-abc',
            'email' => 'otp@example.com',
            'email_verified' => true,
            'name' => 'OTP Student',
        ]);

        $this->assertSame('otp@example.com', $user->email);
        $this->assertSame('firebase-uid-abc', $user->firebase_uid);
        $this->assertTrue($user->hasRole(UserRole::STUDENT->value));
        $this->assertNull($user->password);
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_find_or_create_user_applies_profile_attributes(): void
    {
        $college = College::factory()->create();

        $user = $this->service->findOrCreateUser(
            ['uid' => 'firebase-uid-def', 'email' => 'profile@example.com', 'email_verified' => true],
            ['name' => 'Profile Name', 'phone' => '555-0100', 'college_id' => $college->id],
        );

        $this->assertSame('Profile Name', $user->name);
        $this->assertSame('555-0100', $user->phone);
        $this->assertSame($college->id, $user->college_id);
    }

    public function test_find_or_create_user_links_existing_account_and_keeps_role(): void
    {
        $existing = User::factory()->create(['email' => 'staff@example.com']);
        $existing->assignRole(UserRole::EVENT_MANAGER->value);

        $user = $this->service->findOrCreateUser([
            'uid' => 'firebase-uid-ghi',
            'email' => 'staff@example.com',
            'email_verified' => true,
        ]);

        $this->assertSame($existing->getKey(), $user->getKey());
        $this->assertSame('firebase-uid-ghi', $user->firebase_uid);
        $this->assertTrue($user->hasRole(UserRole::EVENT_MANAGER->value));
    }

    public function test_find_or_create_user_returns_existing_user_for_same_firebase_uid(): void
    {
        $existing = $this->service->findOrCreateUser([
            'uid' => 'firebase-uid-same',
            'email' => 'same@example.com',
            'email_verified' => true,
        ]);

        $again = $this->service->findOrCreateUser([
            'uid' => 'firebase-uid-same',
            'email' => 'same@example.com',
            'email_verified' => true,
        ]);

        $this->assertSame($existing->getKey(), $again->getKey());
        $this->assertDatabaseCount('users', 1);
    }
}
