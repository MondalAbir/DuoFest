<?php

namespace App\Contracts\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use App\Models\College;

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
}
