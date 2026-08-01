<?php

namespace App\Http\Controllers\Api\Registration;

use App\Contracts\Services\RegistrationServiceInterface;
use App\Enums\Permission;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Registration\StoreRegistrationRequest;
use App\Http\Resources\RegistrationResource;
use App\Models\Event;
use App\Models\Registration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegistrationController extends ApiController
{
    public function __construct(
        private readonly RegistrationServiceInterface $registrationService,
    ) {}

    public function store(StoreRegistrationRequest $request, Event $event): JsonResponse
    {
        $registration = $this->registrationService->register($event, $request->user());

        return $this->created(
            new RegistrationResource($registration->load(['event', 'user'])),
            'Registration successful.',
        );
    }

    public function index(Request $request): JsonResponse
    {
        if ($request->user()?->cannot(Permission::REGISTRATION_VIEW_ANY->value)) {
            $request->merge(['user_id' => $request->user()?->getKey()]);
        }

        $registrations = $this->registrationService->paginate($request->only([
            'event_id', 'user_id', 'status', 'ticket_number', 'per_page',
        ]));

        return $this->paginated(RegistrationResource::collection($registrations));
    }

    public function show(Request $request, Registration $registration): JsonResponse
    {
        if ($request->user()?->cannot(Permission::REGISTRATION_VIEW_ANY->value) && $registration->user_id !== $request->user()?->getKey()) {
            return $this->error('You cannot view this registration.', 403);
        }

        return $this->success(new RegistrationResource($registration->load(['event', 'user'])));
    }

    public function cancel(Request $request, Registration $registration): JsonResponse
    {
        if ($request->user()?->cannot(Permission::REGISTRATION_CANCEL->value) && $registration->user_id !== $request->user()?->getKey()) {
            return $this->error('You cannot cancel this registration.', 403);
        }

        $registration = $this->registrationService->cancel($registration);

        return $this->success(new RegistrationResource($registration->load(['event', 'user'])), 'Registration cancelled.');
    }

    public function checkIn(Request $request, Registration $registration): JsonResponse
    {
        $this->authorize(Permission::REGISTRATION_CHECK_IN->value);

        $registration = $this->registrationService->checkIn($registration, $request->user());

        return $this->success(new RegistrationResource($registration->load(['event', 'user'])), 'Checked in successfully.');
    }
}
