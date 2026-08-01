<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\College;
use App\Models\User;
use App\Notifications\CollegeAdminInvitationNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class CollegeTest extends TestCase
{
    use RefreshDatabase;

    public function test_anyone_can_list_colleges(): void
    {
        College::factory()->count(3)->create();

        $this->getJson('/api/v1/colleges')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_anyone_can_view_college(): void
    {
        $college = College::factory()->create();

        $this->getJson("/api/v1/colleges/{$college->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $college->id);
    }

    public function test_admin_can_create_college(): void
    {
        $admin = $this->createUser([], UserRole::SUPER_ADMIN->value);

        $this->actingAsApi($admin)->postJson('/api/v1/colleges', [
            'name' => 'North Campus',
            'code' => 'nc1',
            'city' => 'Pune',
        ])->assertCreated()
            ->assertJsonPath('data.code', 'NC1');

        $this->assertDatabaseHas('colleges', ['code' => 'NC1']);
    }

    public function test_student_cannot_create_college(): void
    {
        $student = $this->createUser();

        $this->actingAsApi($student)
            ->postJson('/api/v1/colleges', [
                'name' => 'Nope',
                'code' => 'NP1',
            ])->assertForbidden();
    }

    public function test_admin_can_update_and_delete_college(): void
    {
        $admin = $this->createUser([], UserRole::SUPER_ADMIN->value);
        $college = College::factory()->create();

        $this->actingAsApi($admin)
            ->putJson("/api/v1/colleges/{$college->id}", ['name' => 'Renamed'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Renamed');

        $this->actingAsApi($admin)
            ->deleteJson("/api/v1/colleges/{$college->id}")
            ->assertOk();

        $this->assertSoftDeleted('colleges', ['id' => $college->id]);
    }

    public function test_college_code_must_be_unique(): void
    {
        $admin = $this->createUser([], UserRole::SUPER_ADMIN->value);
        College::factory()->create(['code' => 'DUP']);

        $this->actingAsApi($admin)->postJson('/api/v1/colleges', [
            'name' => 'Dup College',
            'code' => 'dup',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('code');
    }

    public function test_college_admin_can_update_own_college(): void
    {
        $college = College::factory()->create();
        $admin = $this->createUser(['college_id' => $college->id], UserRole::COLLEGE_ADMIN->value);

        $this->actingAsApi($admin)
            ->putJson("/api/v1/colleges/{$college->id}", ['city' => 'Bengaluru'])
            ->assertOk()
            ->assertJsonPath('data.city', 'Bengaluru');
    }

    public function test_college_admin_cannot_update_other_college(): void
    {
        $own = College::factory()->create();
        $other = College::factory()->create();
        $admin = $this->createUser(['college_id' => $own->id], UserRole::COLLEGE_ADMIN->value);

        $this->actingAsApi($admin)
            ->putJson("/api/v1/colleges/{$other->id}", ['city' => 'Hacked'])
            ->assertForbidden();
    }

    public function test_college_admin_cannot_delete_college(): void
    {
        $college = College::factory()->create();
        $admin = $this->createUser(['college_id' => $college->id], UserRole::COLLEGE_ADMIN->value);

        $this->actingAsApi($admin)
            ->deleteJson("/api/v1/colleges/{$college->id}")
            ->assertForbidden();
    }

    public function test_college_with_users_cannot_be_deleted(): void
    {
        $college = College::factory()->create();
        $this->createUser(['college_id' => $college->id]);
        $admin = $this->createUser([], UserRole::SUPER_ADMIN->value);

        $this->actingAsApi($admin)
            ->deleteJson("/api/v1/colleges/{$college->id}")
            ->assertStatus(409)
            ->assertJsonPath('code', 'college_in_use');

        $this->assertNotSoftDeleted('colleges', ['id' => $college->id]);
    }

    public function test_super_admin_can_invite_new_college_admin(): void
    {
        Notification::fake();

        $college = College::factory()->create();
        $admin = $this->createUser([], UserRole::SUPER_ADMIN->value);

        $this->actingAsApi($admin)
            ->postJson("/api/v1/colleges/{$college->id}/invite-admin", [
                'email' => 'principal@example.com',
                'name' => 'Principal',
            ])->assertOk()
            ->assertJsonPath('data.email', 'principal@example.com')
            ->assertJsonPath('data.roles', [UserRole::COLLEGE_ADMIN->value])
            ->assertJsonPath('data.college_id', $college->id);

        $user = User::query()->where('email', 'principal@example.com')->first();
        $this->assertNotNull($user);
        $this->assertSame($college->id, $user->college_id);
        $this->assertTrue($user->hasRole(UserRole::COLLEGE_ADMIN->value));

        Notification::assertSentTo($user, CollegeAdminInvitationNotification::class);
    }

    public function test_inviting_existing_user_promotes_to_college_admin(): void
    {
        Notification::fake();

        $college = College::factory()->create();
        $admin = $this->createUser([], UserRole::SUPER_ADMIN->value);
        $existing = $this->createUser(['email' => 'person@example.com'], UserRole::STUDENT->value);

        $this->actingAsApi($admin)
            ->postJson("/api/v1/colleges/{$college->id}/invite-admin", [
                'email' => 'person@example.com',
            ])->assertOk()
            ->assertJsonPath('data.id', $existing->id);

        $existing->refresh();
        $this->assertSame($college->id, $existing->college_id);
        $this->assertTrue($existing->hasRole(UserRole::COLLEGE_ADMIN->value));

        Notification::assertSentTo($existing, CollegeAdminInvitationNotification::class);
    }

    public function test_student_cannot_invite_college_admin(): void
    {
        Notification::fake();

        $college = College::factory()->create();
        $student = $this->createUser();

        $this->actingAsApi($student)
            ->postJson("/api/v1/colleges/{$college->id}/invite-admin", [
                'email' => 'hacker@example.com',
            ])->assertForbidden();

        Notification::assertNothingSent();
    }

    public function test_invite_requires_valid_email(): void
    {
        $college = College::factory()->create();
        $admin = $this->createUser([], UserRole::SUPER_ADMIN->value);

        $this->actingAsApi($admin)
            ->postJson("/api/v1/colleges/{$college->id}/invite-admin", [
                'email' => 'not-an-email',
            ])->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }
}
