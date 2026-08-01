<?php

namespace App\Http\Controllers\Api\Volunteer;

use App\Contracts\Services\VolunteerServiceInterface;
use App\Enums\Permission;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Volunteer\AssignVolunteersRequest;
use App\Http\Requests\Volunteer\StoreVolunteerSlotRequest;
use App\Http\Resources\VolunteerSlotResource;
use App\Models\Event;
use App\Models\User;
use App\Models\VolunteerSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VolunteerController extends ApiController
{
    public function __construct(
        private readonly VolunteerServiceInterface $volunteerService,
    ) {}

    public function store(StoreVolunteerSlotRequest $request, Event $event): JsonResponse
    {
        $slot = $event->volunteerSlots()->create($request->validated());

        return $this->created(new VolunteerSlotResource($slot), 'Volunteer slot created.');
    }

    public function mySlots(Request $request): JsonResponse
    {
        $slots = $this->volunteerService->slotsForUser($request->user());

        return $this->success(VolunteerSlotResource::collection($slots), 'Your volunteer slots.');
    }

    public function assign(AssignVolunteersRequest $request, Event $event, VolunteerSlot $slot): JsonResponse
    {
        $result = $this->volunteerService->assign($slot, $request->validated('user_ids'));

        return $this->success($result, 'Volunteers assigned successfully.');
    }

    public function remove(Request $request, Event $event, VolunteerSlot $slot, User $user): JsonResponse
    {
        $this->authorize(Permission::VOLUNTEER_UPDATE->value);

        $this->volunteerService->remove($slot, $user);

        return $this->success(null, 'Volunteer removed from slot.');
    }
}
