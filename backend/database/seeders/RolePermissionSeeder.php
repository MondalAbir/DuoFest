<?php

namespace Database\Seeders;

use App\Enums\Permission;
use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission as SpatiePermission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Permission groups assigned to each role.
     *
     * @var array<string, list<string>>
     */
    private const ROLE_PERMISSIONS = [
        UserRole::SUPER_ADMIN->value => [
            Permission::ADMIN_ACCESS->value,
            Permission::COLLEGE_VIEW_ANY->value, Permission::COLLEGE_VIEW->value,
            Permission::COLLEGE_CREATE->value, Permission::COLLEGE_UPDATE->value,
            Permission::COLLEGE_DELETE->value,
            Permission::EVENT_VIEW_ANY->value, Permission::EVENT_VIEW->value,
            Permission::EVENT_CREATE->value, Permission::EVENT_UPDATE->value,
            Permission::EVENT_DELETE->value, Permission::EVENT_PUBLISH->value,
            Permission::EVENT_ARCHIVE->value, Permission::EVENT_MEDIA->value,
            Permission::EVENT_SPONSOR->value, Permission::EVENT_CERTIFICATE->value,
            Permission::REGISTRATION_VIEW_ANY->value, Permission::REGISTRATION_VIEW->value,
            Permission::REGISTRATION_CREATE->value, Permission::REGISTRATION_UPDATE->value,
            Permission::REGISTRATION_CANCEL->value, Permission::REGISTRATION_CHECK_IN->value,
            Permission::VOLUNTEER_VIEW_ANY->value, Permission::VOLUNTEER_CREATE->value,
            Permission::VOLUNTEER_UPDATE->value, Permission::VOLUNTEER_DELETE->value,
            Permission::VOLUNTEER_SCAN->value,
            Permission::USER_VIEW_ANY->value, Permission::USER_CREATE->value,
            Permission::USER_UPDATE->value,
            Permission::USER_ASSIGN_ROLE->value, Permission::USER_BLOCK->value,
            Permission::ACTIVITY_LOG_VIEW_ANY->value,
        ],
        UserRole::COLLEGE_ADMIN->value => [
            Permission::ADMIN_ACCESS->value,
            Permission::COLLEGE_VIEW_ANY->value, Permission::COLLEGE_VIEW->value,
            Permission::COLLEGE_CREATE->value, Permission::COLLEGE_UPDATE->value,
            Permission::EVENT_VIEW_ANY->value, Permission::EVENT_VIEW->value,
            Permission::EVENT_CREATE->value, Permission::EVENT_UPDATE->value,
            Permission::EVENT_PUBLISH->value, Permission::EVENT_ARCHIVE->value,
            Permission::EVENT_MEDIA->value, Permission::EVENT_SPONSOR->value,
            Permission::EVENT_CERTIFICATE->value,
            Permission::REGISTRATION_VIEW_ANY->value, Permission::REGISTRATION_VIEW->value,
            Permission::REGISTRATION_UPDATE->value, Permission::REGISTRATION_CHECK_IN->value,
            Permission::VOLUNTEER_VIEW_ANY->value, Permission::VOLUNTEER_CREATE->value,
            Permission::VOLUNTEER_UPDATE->value, Permission::VOLUNTEER_DELETE->value,
            Permission::USER_VIEW_ANY->value, Permission::USER_UPDATE->value,
            Permission::ACTIVITY_LOG_VIEW_ANY->value,
        ],
        UserRole::EVENT_MANAGER->value => [
            Permission::EVENT_VIEW_ANY->value, Permission::EVENT_VIEW->value,
            Permission::EVENT_CREATE->value, Permission::EVENT_UPDATE->value,
            Permission::EVENT_PUBLISH->value, Permission::EVENT_ARCHIVE->value,
            Permission::EVENT_MEDIA->value, Permission::EVENT_SPONSOR->value,
            Permission::EVENT_CERTIFICATE->value,
            Permission::REGISTRATION_VIEW_ANY->value, Permission::REGISTRATION_VIEW->value,
            Permission::REGISTRATION_CHECK_IN->value,
            Permission::VOLUNTEER_VIEW_ANY->value, Permission::VOLUNTEER_CREATE->value,
            Permission::VOLUNTEER_UPDATE->value,
        ],
        UserRole::VOLUNTEER->value => [
            Permission::EVENT_VIEW_ANY->value, Permission::EVENT_VIEW->value,
            Permission::REGISTRATION_CREATE->value, Permission::REGISTRATION_VIEW->value,
            Permission::VOLUNTEER_SCAN->value,
        ],
        UserRole::STUDENT->value => [
            Permission::EVENT_VIEW_ANY->value, Permission::EVENT_VIEW->value,
            Permission::REGISTRATION_CREATE->value, Permission::REGISTRATION_VIEW->value,
            Permission::REGISTRATION_CANCEL->value,
        ],
    ];

    public function run(): void
    {
        $guardName = config('auth.defaults.guard', 'web');

        foreach (Permission::values() as $permission) {
            SpatiePermission::firstOrCreate(['name' => $permission, 'guard_name' => $guardName]);
        }

        foreach (UserRole::values() as $role) {
            $roleModel = Role::firstOrCreate(['name' => $role, 'guard_name' => $guardName]);

            $roleModel->syncPermissions(self::ROLE_PERMISSIONS[$role] ?? []);
        }
    }
}
