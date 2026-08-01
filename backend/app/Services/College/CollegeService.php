<?php

namespace App\Services\College;

use App\Contracts\Repositories\CollegeRepositoryInterface;
use App\Contracts\Services\CollegeServiceInterface;
use App\Enums\ActivityType;
use App\Enums\UserRole;
use App\Exceptions\ApiException;
use App\Models\College;
use App\Models\User;
use App\Notifications\CollegeAdminInvitationNotification;
use App\Services\ActivityLog\ActivityLogService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class CollegeService implements CollegeServiceInterface
{
    public function __construct(
        private readonly CollegeRepositoryInterface $colleges,
        private readonly ActivityLogService $activityLog,
    ) {}

    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->colleges->paginate($filters);
    }

    public function find(int $id): College
    {
        return $this->colleges->find($id);
    }

    public function create(array $data): College
    {
        return DB::transaction(fn () => $this->colleges->create($data));
    }

    public function update(College $college, array $data): College
    {
        return DB::transaction(fn () => $this->colleges->update($college, $data));
    }

    public function delete(College $college): void
    {
        if ($college->users()->exists() || $college->events()->exists()) {
            throw new ApiException(
                'Cannot delete a college that still has users or events.',
                409,
                errorCode: 'college_in_use',
            );
        }

        DB::transaction(fn () => $this->colleges->delete($college));
    }

    public function inviteAdmin(College $college, array $data): User
    {
        return DB::transaction(function () use ($college, $data) {
            $user = User::query()->where('email', $data['email'])->first();

            $isNew = $user === null;

            if (! $user) {
                $user = new User([
                    'name' => $data['name'] ?? Str::title(Str::before($data['email'], '@')),
                    'email' => $data['email'],
                    'password' => Hash::make(Str::random(32)),
                    'college_id' => $college->id,
                    'is_active' => true,
                ]);
            }

            $user->college_id = $college->id;
            $user->save();

            if (! $user->hasRole(UserRole::COLLEGE_ADMIN->value)) {
                $user->assignRole(UserRole::COLLEGE_ADMIN->value);
            }

            // New accounts (and accounts without a local password) get a
            // password-set token so the invitee can activate the account.
            $setupToken = ($isNew || $user->password === null)
                ? Password::broker()->createToken($user)
                : null;

            $user->notify(new CollegeAdminInvitationNotification($college, $setupToken));

            $this->activityLog->record(
                subject: $college,
                type: ActivityType::INVITED,
                causer: request()->user(),
                description: "Invited {$user->email} as college admin",
                properties: [
                    'user_id' => $user->getKey(),
                    'college_id' => $college->getKey(),
                    'role' => UserRole::COLLEGE_ADMIN->value,
                ],
            );

            return $user;
        });
    }
}
