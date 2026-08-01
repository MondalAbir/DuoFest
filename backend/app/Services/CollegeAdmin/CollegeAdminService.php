<?php

namespace App\Services\CollegeAdmin;

use App\Contracts\Services\AuthServiceInterface;
use App\Contracts\Services\CollegeAdminServiceInterface;
use App\Enums\ActivityType;
use App\Enums\UserRole;
use App\Models\User;
use App\Notifications\CollegeAdminInvitationNotification;
use App\Notifications\CollegeAdminSuspendedNotification;
use App\Notifications\CollegeAdminWelcomeNotification;
use App\Notifications\ResetPasswordNotification;
use App\Services\ActivityLog\ActivityLogService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class CollegeAdminService implements CollegeAdminServiceInterface
{
    public function __construct(
        private readonly AuthServiceInterface $auth,
        private readonly ActivityLogService $activityLog,
    ) {}

    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return User::query()
            ->role(UserRole::COLLEGE_ADMIN->value)
            ->with(['college', 'roles'])
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($filters['college_id'] ?? null, fn ($query, $collegeId) => $query->where('college_id', $collegeId))
            ->when(isset($filters['is_active']), function ($query) use ($filters) {
                $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOL));
            })
            ->when(isset($filters['suspended']), function ($query) {
                $query->whereNotNull('blocked_at');
            })
            ->orderBy('name')
            ->paginate((int) ($filters['per_page'] ?? config('api.per_page')));
    }

    public function find(int $id): User
    {
        return User::query()->role(UserRole::COLLEGE_ADMIN->value)
            ->with(['college', 'roles'])
            ->findOrFail($id);
    }

    public function create(array $data): User
    {
        $user = DB::transaction(function () use ($data) {
            $created = $this->auth->createUser([
                ...$data,
                'role' => UserRole::COLLEGE_ADMIN->value,
            ]);

            $created->notify(new CollegeAdminWelcomeNotification);

            return $created;
        });

        return $user->load(['college', 'roles']);
    }

    public function update(User $admin, array $data): User
    {
        return DB::transaction(function () use ($admin, $data) {
            $admin->update($data);

            $this->activityLog->record(
                subject: $admin,
                type: ActivityType::UPDATED,
                causer: request()->user(),
                description: "Updated college admin profile for {$admin->email}",
            );

            return $admin->load(['college', 'roles']);
        });
    }

    public function delete(User $admin): void
    {
        DB::transaction(function () use ($admin) {
            $admin->tokens()->delete();

            $admin->delete();

            $this->activityLog->record(
                subject: $admin,
                type: ActivityType::DELETED,
                causer: request()->user(),
                description: "Deleted college admin account {$admin->email}",
            );
        });
    }

    public function suspend(User $admin): void
    {
        DB::transaction(function () use ($admin) {
            $admin->forceFill(['blocked_at' => now()])->save();
            $admin->tokens()->delete();

            $admin->notify(new CollegeAdminSuspendedNotification);

            $this->activityLog->record(
                subject: $admin,
                type: ActivityType::SUSPENDED,
                causer: request()->user(),
                description: "Suspended college admin account {$admin->email}",
            );
        });
    }

    public function restore(User $admin): void
    {
        DB::transaction(function () use ($admin) {
            $admin->forceFill([
                'blocked_at' => null,
                'is_active' => true,
            ])->save();

            $this->activityLog->record(
                subject: $admin,
                type: ActivityType::UNSUSPENDED,
                causer: request()->user(),
                description: "Restored college admin account {$admin->email}",
            );
        });
    }

    public function resetPassword(User $admin): void
    {
        $token = Password::broker()->createToken($admin);

        $admin->notify(new ResetPasswordNotification($token));

        $this->activityLog->record(
            subject: $admin,
            type: ActivityType::PASSWORD_RESET,
            causer: request()->user(),
            description: "Password reset triggered for {$admin->email}",
        );
    }

    public function invite(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $admin = User::query()->where('email', $data['email'])->first();

            if (! $admin) {
                $admin = new User([
                    'name' => $data['name'] ?? Str::title(Str::before($data['email'], '@')),
                    'email' => $data['email'],
                    'password' => Hash::make(Str::random(32)),
                    'college_id' => $data['college_id'] ?? null,
                    'is_active' => true,
                ]);
            }

            if (isset($data['college_id'])) {
                $admin->college_id = $data['college_id'];
            }

            $admin->save();

            if (! $admin->hasRole(UserRole::COLLEGE_ADMIN->value)) {
                $admin->assignRole(UserRole::COLLEGE_ADMIN->value);
            }

            $setupToken = Password::broker()->createToken($admin);

            $admin->notify(new CollegeAdminInvitationNotification($admin->college, $setupToken));

            $this->activityLog->record(
                subject: $admin,
                type: ActivityType::INVITED,
                causer: request()->user(),
                description: "Invited {$admin->email} as college admin",
                properties: ['college_id' => $admin->college_id],
            );

            return $admin->load(['college', 'roles']);
        });
    }

    public function assignCollege(User $admin, int $collegeId): User
    {
        return DB::transaction(function () use ($admin, $collegeId) {
            $admin->forceFill(['college_id' => $collegeId])->save();

            $this->activityLog->record(
                subject: $admin,
                type: ActivityType::COLLEGE_ASSIGNED,
                causer: request()->user(),
                description: "Assigned {$admin->email} to college #{$collegeId}",
                properties: ['college_id' => $collegeId],
            );

            return $admin->load(['college', 'roles']);
        });
    }

    public function updateRoles(User $admin, array $roles): User
    {
        return DB::transaction(function () use ($admin, $roles) {
            $admin->syncRoles($roles);

            $this->activityLog->record(
                subject: $admin,
                type: ActivityType::ROLE_ASSIGNED,
                causer: request()->user(),
                description: "Updated roles for {$admin->email}",
                properties: ['roles' => $roles],
            );

            return $admin->load(['college', 'roles']);
        });
    }
}
