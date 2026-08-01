<?php

namespace Tests\Feature;

use App\Enums\ActivityType;
use App\Enums\UserRole;
use App\Models\College;
use App\Models\User;
use App\Notifications\CollegeAdminInvitationNotification;
use App\Notifications\CollegeAdminSuspendedNotification;
use App\Notifications\CollegeAdminWelcomeNotification;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class CollegeAdminTest extends TestCase
{
    use RefreshDatabase;

    private function superAdmin(): User
    {
        return $this->createUser([], UserRole::SUPER_ADMIN->value);
    }

    private function collegeAdmin(array $attributes = []): User
    {
        return $this->createUser($attributes, UserRole::COLLEGE_ADMIN->value);
    }

    public function test_super_admin_can_create_college_admin(): void
    {
        Notification::fake();

        $college = College::factory()->create();

        $this->actingAsApi($this->superAdmin())
            ->postJson('/api/v1/college-admins', [
                'name' => 'New Principal',
                'email' => 'principal@example.com',
                'password' => 'secret123',
                'password_confirmation' => 'secret123',
                'college_id' => $college->id,
            ])->assertCreated()
            ->assertJsonPath('data.email', 'principal@example.com')
            ->assertJsonPath('data.roles', [UserRole::COLLEGE_ADMIN->value])
            ->assertJsonPath('data.college_id', $college->id);

        $user = User::query()->where('email', 'principal@example.com')->first();
        $this->assertTrue($user->hasRole(UserRole::COLLEGE_ADMIN->value));

        Notification::assertSentTo($user, CollegeAdminWelcomeNotification::class);
    }

    public function test_student_cannot_create_college_admin(): void
    {
        $student = $this->createUser();

        $this->actingAsApi($student)
            ->postJson('/api/v1/college-admins', [
                'name' => 'Nope',
                'email' => 'nope@example.com',
                'password' => 'secret123',
                'password_confirmation' => 'secret123',
            ])->assertForbidden();
    }

    public function test_college_admin_creation_validates_input(): void
    {
        $this->actingAsApi($this->superAdmin())
            ->postJson('/api/v1/college-admins', [
                'name' => '',
                'email' => 'not-an-email',
                'password' => 'short',
            ])->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_super_admin_can_list_college_admins(): void
    {
        $this->collegeAdmin(['name' => 'Admin One']);
        $this->collegeAdmin(['name' => 'Admin Two']);
        $this->createUser(['name' => 'A Student']);

        $this->actingAsApi($this->superAdmin())
            ->getJson('/api/v1/college-admins')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_super_admin_can_view_college_admin_profile(): void
    {
        $admin = $this->collegeAdmin(['email' => 'view@example.com']);

        $this->actingAsApi($this->superAdmin())
            ->getJson("/api/v1/college-admins/{$admin->id}")
            ->assertOk()
            ->assertJsonPath('data.email', 'view@example.com');
    }

    public function test_super_admin_can_update_college_admin(): void
    {
        $admin = $this->collegeAdmin(['email' => 'update@example.com']);

        $this->actingAsApi($this->superAdmin())
            ->putJson("/api/v1/college-admins/{$admin->id}", ['name' => 'Renamed'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Renamed');
    }

    public function test_super_admin_can_delete_college_admin(): void
    {
        $admin = $this->collegeAdmin(['email' => 'delete@example.com']);
        $admin->createToken('session');

        $this->actingAsApi($this->superAdmin())
            ->deleteJson("/api/v1/college-admins/{$admin->id}")
            ->assertOk();

        $this->assertSoftDeleted('users', ['id' => $admin->id]);
        $this->assertDatabaseCount('personal_access_tokens', 0);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'delete@example.com',
            'password' => 'password',
        ])->assertUnauthorized();
    }

    public function test_super_admin_cannot_delete_self(): void
    {
        $admin = $this->superAdmin();

        $this->actingAsApi($admin)
            ->deleteJson("/api/v1/college-admins/{$admin->id}")
            ->assertForbidden();
    }

    public function test_super_admin_can_suspend_and_restore_college_admin(): void
    {
        Notification::fake();

        $admin = $this->collegeAdmin(['email' => 'suspend@example.com']);
        $admin->createToken('session');

        $this->actingAsApi($this->superAdmin())
            ->postJson("/api/v1/college-admins/{$admin->id}/suspend")
            ->assertOk();

        $admin->refresh();
        $this->assertNotNull($admin->blocked_at);
        $this->assertDatabaseCount('personal_access_tokens', 0);

        Notification::assertSentTo($admin, CollegeAdminSuspendedNotification::class);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'suspend@example.com',
            'password' => 'password',
        ])->assertForbidden()
            ->assertJsonPath('code', 'account_blocked');

        $this->actingAsApi($this->superAdmin())
            ->postJson("/api/v1/college-admins/{$admin->id}/restore")
            ->assertOk();

        $admin->refresh();
        $this->assertNull($admin->blocked_at);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'suspend@example.com',
            'password' => 'password',
        ])->assertOk();
    }

    public function test_super_admin_cannot_suspend_self(): void
    {
        $admin = $this->superAdmin();

        $this->actingAsApi($admin)
            ->postJson("/api/v1/college-admins/{$admin->id}/suspend")
            ->assertForbidden();
    }

    public function test_super_admin_can_reset_college_admin_password(): void
    {
        Notification::fake();

        $admin = $this->collegeAdmin(['email' => 'reset@example.com']);

        $this->actingAsApi($this->superAdmin())
            ->postJson("/api/v1/college-admins/{$admin->id}/reset-password")
            ->assertOk();

        Notification::assertSentTo($admin, ResetPasswordNotification::class);
    }

    public function test_super_admin_can_invite_college_admin(): void
    {
        Notification::fake();

        $this->actingAsApi($this->superAdmin())
            ->postJson('/api/v1/college-admins/invite', [
                'name' => 'Invited',
                'email' => 'invited@example.com',
            ])->assertOk()
            ->assertJsonPath('data.email', 'invited@example.com')
            ->assertJsonPath('data.roles', [UserRole::COLLEGE_ADMIN->value]);

        $user = User::query()->where('email', 'invited@example.com')->first();
        $this->assertTrue($user->hasRole(UserRole::COLLEGE_ADMIN->value));

        Notification::assertSentTo($user, CollegeAdminInvitationNotification::class);
    }

    public function test_invited_admin_can_accept_invitation_and_sign_in(): void
    {
        $admin = $this->collegeAdmin(['email' => 'accept@example.com']);
        $token = Password::broker()->createToken($admin);

        $this->postJson('/api/v1/auth/invitations/accept', [
            'email' => 'accept@example.com',
            'token' => $token,
            'password' => 'newpass123',
            'password_confirmation' => 'newpass123',
        ])->assertOk();

        $this->postJson('/api/v1/auth/login', [
            'email' => 'accept@example.com',
            'password' => 'newpass123',
        ])->assertOk();
    }

    public function test_super_admin_can_assign_college(): void
    {
        $college = College::factory()->create();
        $admin = $this->collegeAdmin(['email' => 'assign@example.com']);

        $this->actingAsApi($this->superAdmin())
            ->postJson("/api/v1/college-admins/{$admin->id}/assign-college", [
                'college_id' => $college->id,
            ])->assertOk()
            ->assertJsonPath('data.college_id', $college->id);
    }

    public function test_super_admin_can_manage_roles(): void
    {
        $admin = $this->collegeAdmin(['email' => 'roles@example.com']);

        $this->actingAsApi($this->superAdmin())
            ->putJson("/api/v1/college-admins/{$admin->id}/roles", [
                'roles' => [UserRole::EVENT_MANAGER->value, UserRole::VOLUNTEER->value],
            ])->assertOk();

        $admin->refresh();
        $this->assertTrue($admin->hasRole(UserRole::EVENT_MANAGER->value));
        $this->assertTrue($admin->hasRole(UserRole::VOLUNTEER->value));
        $this->assertFalse($admin->hasRole(UserRole::COLLEGE_ADMIN->value));
    }

    public function test_roles_management_validates_role_values(): void
    {
        $admin = $this->collegeAdmin();

        $this->actingAsApi($this->superAdmin())
            ->putJson("/api/v1/college-admins/{$admin->id}/roles", [
                'roles' => ['not_a_role'],
            ])->assertUnprocessable()
            ->assertJsonValidationErrors('roles.0');
    }

    public function test_management_actions_are_recorded_in_activity_logs(): void
    {
        $admin = $this->collegeAdmin(['email' => 'logged@example.com']);
        $super = $this->superAdmin();

        $this->actingAsApi($super)
            ->postJson("/api/v1/college-admins/{$admin->id}/suspend")
            ->assertOk();

        $this->assertDatabaseHas('activity_logs', [
            'subject_id' => $admin->id,
            'causer_id' => $super->id,
            'type' => ActivityType::SUSPENDED->value,
        ]);

        $this->actingAsApi($super)
            ->getJson('/api/v1/activity-logs?subject_id='.$admin->id)
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
