<?php

namespace App\Contracts\Services;

use App\Models\College;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CollegeServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator;

    public function find(int $id): College;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): College;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(College $college, array $data): College;

    public function delete(College $college): void;

    /**
     * Find-or-create the invitee, promote them to college admin, scope them
     * to the college and send the invitation email.
     *
     * @param  array<string, mixed>  $data
     */
    public function inviteAdmin(College $college, array $data): User;
}
