<?php

namespace App\Contracts\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CollegeAdminServiceInterface
{
    /**
     * Paginate users holding the college_admin role.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator;

    /**
     * Find a college admin by primary key.
     */
    public function find(int $id): User;

    /**
     * Create a college admin account with a known password.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): User;

    /**
     * Update a college admin's profile details.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(User $admin, array $data): User;

    /**
     * Soft delete a college admin and revoke their sessions.
     */
    public function delete(User $admin): void;

    /**
     * Block a college admin and revoke their sessions.
     */
    public function suspend(User $admin): void;

    /**
     * Unblock a previously suspended college admin.
     */
    public function restore(User $admin): void;

    /**
     * Trigger a password reset email for a college admin.
     */
    public function resetPassword(User $admin): void;

    /**
     * Find-or-create an account, promote it to college admin and email an
     * invitation with a password-set token.
     *
     * @param  array<string, mixed>  $data
     */
    public function invite(array $data): User;

    /**
     * Assign a college to a college admin.
     */
    public function assignCollege(User $admin, int $collegeId): User;

    /**
     * Replace the user's roles.
     *
     * @param  list<string>  $roles
     */
    public function updateRoles(User $admin, array $roles): User;
}
