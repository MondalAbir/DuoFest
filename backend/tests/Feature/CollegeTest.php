<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\College;
use Tests\TestCase;

class CollegeTest extends TestCase
{
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
            'code' => 'NC1',
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
            'code' => 'DUP',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('code');
    }
}
