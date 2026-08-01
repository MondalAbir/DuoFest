<?php

namespace App\Http\Controllers\Api\College;

use App\Contracts\Services\CollegeServiceInterface;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\College\StoreCollegeRequest;
use App\Http\Requests\College\UpdateCollegeRequest;
use App\Http\Resources\CollegeResource;
use App\Models\College;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CollegeController extends ApiController
{
    public function __construct(
        private readonly CollegeServiceInterface $collegeService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $colleges = $this->collegeService->paginate($request->only(['search', 'is_active', 'per_page']));

        return $this->paginated(CollegeResource::collection($colleges));
    }

    public function store(StoreCollegeRequest $request): JsonResponse
    {
        $college = $this->collegeService->create($request->validated());

        return $this->created(new CollegeResource($college), 'College created successfully.');
    }

    public function show(int $id): JsonResponse
    {
        return $this->success(new CollegeResource($this->collegeService->find($id)));
    }

    public function update(UpdateCollegeRequest $request, College $college): JsonResponse
    {
        $college = $this->collegeService->update($college, $request->validated());

        return $this->success(new CollegeResource($college), 'College updated successfully.');
    }

    public function destroy(College $college): JsonResponse
    {
        $this->collegeService->delete($college);

        return $this->success(null, 'College deleted successfully.');
    }
}
