<?php

namespace App\Contracts\Repositories;

use App\Models\College;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CollegeRepositoryInterface
{
    /**
     * Paginate colleges with optional filters (search, is_active, per_page).
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator;

    /**
     * Find a college by primary key or throw a ModelNotFoundException.
     */
    public function find(int $id): College;

    /**
     * Find a college by its unique code.
     */
    public function findByCode(string $code): ?College;

    /**
     * Create and persist a new college.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): College;

    /**
     * Persist changes to an existing college.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(College $college, array $data): College;

    /**
     * Soft delete a college.
     */
    public function delete(College $college): bool;
}
