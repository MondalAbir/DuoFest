<?php

namespace App\Services\College;

use App\Contracts\Services\CollegeServiceInterface;
use App\Models\College;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CollegeService implements CollegeServiceInterface
{
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return College::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%");
                });
            })
            ->when(isset($filters['is_active']), function ($query) use ($filters) {
                $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOL));
            })
            ->withCount('events')
            ->orderBy('name')
            ->paginate((int) ($filters['per_page'] ?? config('api.per_page')));
    }

    public function find(int $id): College
    {
        return College::query()->withCount('events')->findOrFail($id);
    }

    public function create(array $data): College
    {
        $college = College::query()->create($data);

        $college->loadCount('events');

        return $college;
    }

    public function update(College $college, array $data): College
    {
        $college->update($data);

        $college->loadCount('events');

        return $college;
    }

    public function delete(College $college): void
    {
        $college->delete();
    }
}
