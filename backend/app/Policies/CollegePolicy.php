<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\College;
use App\Models\User;

class CollegePolicy
{
    /**
     * College listings are public.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * College details are public.
     */
    public function view(User $user, College $college): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(Permission::COLLEGE_CREATE->value);
    }

    /**
     * Super admins manage any college; college admins are scoped to their own.
     */
    public function update(User $user, College $college): bool
    {
        if (! $user->hasPermissionTo(Permission::COLLEGE_UPDATE->value)) {
            return false;
        }

        return $user->isSuperAdmin() || $user->college_id === $college->id;
    }

    public function delete(User $user, College $college): bool
    {
        return $user->hasPermissionTo(Permission::COLLEGE_DELETE->value);
    }

    /**
     * Only a super admin may appoint college admins.
     */
    public function inviteAdmin(User $user, College $college): bool
    {
        return $user->isSuperAdmin();
    }
}
