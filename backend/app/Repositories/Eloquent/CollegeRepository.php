<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\CollegeRepositoryInterface;
use App\Models\College;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CollegeRepository implements CollegeRepositoryInterface
{
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return College::query()
            ->withCount('events')
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%");
                });
            })
            ->when(isset($filters['is_active']), function ($query) use ($filters) {
                $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOL));
            })
            ->orderBy('name')
            ->paginate((int) ($filters['per_page'] ?? config('api.per_page')));
    }

    public function find(int $id): College
    {
        return College::query()->withCount('events')->findOrFail($id);
    }

    public function findByCode(string $code): ?College
    {
        return College::query()->where('code', $code)->first();
    }

    public function create(array $data): College
    {
        return tap(College::query()->create($data), function (College $college) {
            $college->loadCount('events');
        });
    }

    public function update(College $college, array $data): College
    {
        $college->update($data);

        return $college->loadCount('events');
    }

    public function delete(College $college): bool
    {
        return (bool) $college->delete();
    }
}
