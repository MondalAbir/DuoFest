<?php

namespace App\Http\Controllers\Api\Volunteer;

use App\Contracts\Services\VolunteerServiceInterface;
use App\Enums\Permission;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Volunteer\AssignVolunteersRequest;
use App\Http\Requests\Volunteer\StoreVolunteerRequest;
use App\Http\Resources\VolunteerResource;
use App\Models\Event;
use App\Models\Volunteer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VolunteerController extends ApiController
{
    public function __construct(
        private readonly VolunteerServiceInterface $volunteerService,
    ) {}

    public function index(Request $request, Event $event): JsonResponse
    {
        $this->authorize(Permission::VOLUNTEER_VIEW_ANY->value);

        $volunteers = $event->volunteers()->with('user')->get();

        return $this->success(VolunteerResource::collection($volunteers), 'Event volunteers.');
    }

    public function store(StoreVolunteerRequest $request, Event $event): JsonResponse
    {
        $volunteer = $this->volunteerService->createForEvent($event, $request->validated());

        return $this->created(new VolunteerResource($volunteer->load('user')), 'Volunteer added.');
    }

    public function assign(AssignVolunteersRequest $request, Event $event): JsonResponse
    {
        $result = $this->volunteerService->assign(
            $event,
            $request->validated('user_ids'),
            $request->safe()->except('user_ids'),
        );

        return $this->success($result, 'Volunteers assigned successfully.');
    }

    public function destroy(Request $request, Volunteer $volunteer): JsonResponse
    {
        $this->authorize(Permission::VOLUNTEER_UPDATE->value);

        $this->volunteerService->remove($volunteer);

        return $this->success(null, 'Volunteer removed.');
    }

    public function myVolunteering(Request $request): JsonResponse
    {
        $volunteers = $this->volunteerService->assignmentsForUser($request->user());

        return $this->success(VolunteerResource::collection($volunteers), 'Your volunteer assignments.');
    }
}
