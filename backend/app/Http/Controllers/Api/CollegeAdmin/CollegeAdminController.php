<?php

namespace App\Http\Controllers\Api\CollegeAdmin;

use App\Contracts\Services\CollegeAdminServiceInterface;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\CollegeAdmin\AssignCollegeRequest;
use App\Http\Requests\CollegeAdmin\InviteCollegeAdminRequest;
use App\Http\Requests\CollegeAdmin\ManageRolesRequest;
use App\Http\Requests\CollegeAdmin\StoreCollegeAdminRequest;
use App\Http\Requests\CollegeAdmin\UpdateCollegeAdminRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CollegeAdminController extends ApiController
{
    public function __construct(
        private readonly CollegeAdminServiceInterface $collegeAdminService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $admins = $this->collegeAdminService->paginate($request->only([
            'search', 'college_id', 'is_active', 'suspended', 'per_page',
        ]));

        return $this->paginated(UserResource::collection($admins));
    }

    public function store(StoreCollegeAdminRequest $request): JsonResponse
    {
        $admin = $this->collegeAdminService->create($request->validated());

        return $this->created(new UserResource($admin), 'College admin created successfully.');
    }

    public function show(User $user): JsonResponse
    {
        return $this->success(new UserResource($user->load(['college', 'roles'])), 'College admin profile retrieved.');
    }

    public function update(UpdateCollegeAdminRequest $request, User $user): JsonResponse
    {
        $admin = $this->collegeAdminService->update($user, $request->validated());

        return $this->success(new UserResource($admin), 'College admin updated successfully.');
    }

    public function destroy(User $user): JsonResponse
    {
        $this->collegeAdminService->delete($user);

        return $this->success(null, 'College admin deleted successfully.');
    }

    public function suspend(User $user): JsonResponse
    {
        $this->collegeAdminService->suspend($user);

        return $this->success(null, 'College admin suspended successfully.');
    }

    public function restore(User $user): JsonResponse
    {
        $this->collegeAdminService->restore($user);

        return $this->success(null, 'College admin restored successfully.');
    }

    public function resetPassword(User $user): JsonResponse
    {
        $this->collegeAdminService->resetPassword($user);

        return $this->success(null, "Password reset email sent to {$user->email}.");
    }

    public function invite(InviteCollegeAdminRequest $request): JsonResponse
    {
        $admin = $this->collegeAdminService->invite($request->validated());

        return $this->success(new UserResource($admin), "Invitation sent to {$admin->email}.");
    }

    public function assignCollege(AssignCollegeRequest $request, User $user): JsonResponse
    {
        $admin = $this->collegeAdminService->assignCollege($user, (int) $request->validated('college_id'));

        return $this->success(new UserResource($admin), 'College assigned successfully.');
    }

    public function updateRoles(ManageRolesRequest $request, User $user): JsonResponse
    {
        $admin = $this->collegeAdminService->updateRoles($user, $request->validated('roles'));

        return $this->success(new UserResource($admin), 'Roles updated successfully.');
    }
}
