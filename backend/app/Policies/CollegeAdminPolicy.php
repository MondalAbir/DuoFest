<?php

namespace App\Policies;

use App\Models\User;

class CollegeAdminPolicy
{
    /**
     * Managing college admins is a super admin responsibility.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function view(User $user, User $admin): bool
    {
        return $user->isSuperAdmin() || $user->getKey() === $admin->getKey();
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, User $admin): bool
    {
        return $user->isSuperAdmin();
    }

    public function delete(User $user, User $admin): bool
    {
        return $user->isSuperAdmin() && $user->getKey() !== $admin->getKey();
    }

    public function suspend(User $user, User $admin): bool
    {
        return $user->isSuperAdmin() && $user->getKey() !== $admin->getKey();
    }

    public function restore(User $user, User $admin): bool
    {
        return $user->isSuperAdmin();
    }

    public function resetPassword(User $user, User $admin): bool
    {
        return $user->isSuperAdmin();
    }

    public function invite(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function assignCollege(User $user, User $admin): bool
    {
        return $user->isSuperAdmin();
    }

    public function manageRoles(User $user, User $admin): bool
    {
        return $user->isSuperAdmin() && $user->getKey() !== $admin->getKey();
    }
}
