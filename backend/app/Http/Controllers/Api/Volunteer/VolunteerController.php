<?php

namespace App\Http\Controllers\Api\Volunteer;

use App\Contracts\Services\VolunteerServiceInterface;
use App\Enums\Permission;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Volunteer\AssignVolunteersRequest;
use App\Http\Requests\Volunteer\CheckInScanRequest;
use App\Http\Requests\Volunteer\StoreVolunteerRequest;
use App\Http\Requests\Volunteer\ValidateScanRequest;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\RegistrationResource;
use App\Http\Resources\UserResource;
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

    public function profile(Request $request): JsonResponse
    {
        $profile = $this->volunteerService->profile($request->user());

        return $this->success([
            'user' => new UserResource($profile['user']),
            'assigned_events_count' => $profile['assigned_events_count'],
            'today_entries_count' => $profile['today_entries_count'],
        ], 'Volunteer profile.');
    }

    public function assignedEvents(Request $request): JsonResponse
    {
        $volunteers = $this->volunteerService->assignedEvents($request->user());

        return $this->success(VolunteerResource::collection($volunteers), 'Your assigned events.');
    }

    public function todayEntries(Request $request): JsonResponse
    {
        $entries = $this->volunteerService->todayEntries($request->user());

        return $this->success(AttendanceResource::collection($entries), 'Entries scanned today.');
    }

    /**
     * Dry-run: decode a scanned QR payload and report its status.
     */
    public function validateScan(ValidateScanRequest $request, Event $event): JsonResponse
    {
        $result = $this->volunteerService->validateScan($request->user(), $event, $request->validated('payload'));

        $data = ['status' => $result['status']];

        if ($result['registration']) {
            $data['registration'] = new RegistrationResource($result['registration']->load(['event']));
        }

        return $this->success($data);
    }

    /**
     * Decode a scanned QR payload, validate it and record attendance.
     */
    public function checkInScan(CheckInScanRequest $request, Event $event): JsonResponse
    {
        $attendance = $this->volunteerService->checkInScan($request->user(), $event, $request->validated('payload'));

        return $this->created(
            new AttendanceResource($attendance->load(['event', 'registration'])),
            'Entry recorded.',
        );
    }
}
