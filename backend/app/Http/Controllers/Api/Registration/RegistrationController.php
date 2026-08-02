<?php

namespace App\Http\Controllers\Api\Registration;

use App\Contracts\Services\RegistrationServiceInterface;
use App\Contracts\Services\TicketServiceInterface;
use App\Enums\Permission;
use App\Exceptions\ApiException;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Registration\RequestOtpRequest;
use App\Http\Requests\Registration\StoreRegistrationRequest;
use App\Http\Requests\Registration\VerifyOtpRequest;
use App\Http\Resources\RegistrationResource;
use App\Models\Event;
use App\Models\Registration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class RegistrationController extends ApiController
{
    public function __construct(
        private readonly RegistrationServiceInterface $registrationService,
        private readonly TicketServiceInterface $ticketService,
    ) {}

    public function store(StoreRegistrationRequest $request, Event $event): JsonResponse
    {
        $registration = $this->registrationService->register($event, $request->user());

        return $this->created(
            new RegistrationResource($registration->load(['event', 'user'])),
            'Registration successful.',
        );
    }

    /**
     * Step 1 of the guest (no-account) flow: send a numeric OTP to the email.
     */
    public function requestOtp(RequestOtpRequest $request, Event $event): JsonResponse
    {
        $this->registrationService->requestOtp($event, $request->validated());

        return $this->success([], 'Verification code sent to your email.');
    }

    /**
     * Step 2 of the guest flow: verify the OTP and store the registration.
     */
    public function verifyOtp(VerifyOtpRequest $request, Event $event): JsonResponse
    {
        $registration = $this->registrationService->verifyOtp($event, $request->validated());

        return $this->created(
            new RegistrationResource($registration->load(['event'])),
            'Registration successful. Your ticket has been emailed.',
        );
    }

    public function index(Request $request): JsonResponse
    {
        if ($request->user()?->cannot(Permission::REGISTRATION_VIEW_ANY->value)) {
            $request->merge(['user_id' => $request->user()?->getKey()]);
        }

        $registrations = $this->registrationService->paginate($request->only([
            'event_id', 'user_id', 'email', 'status', 'ticket_number', 'per_page',
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

    /**
     * Download the issued PDF ticket.
     */
    public function ticket(Request $request, Registration $registration): BinaryFileResponse|JsonResponse
    {
        if ($request->user()?->cannot(Permission::REGISTRATION_VIEW_ANY->value) && $registration->user_id !== $request->user()?->getKey()) {
            return $this->error('You cannot view this registration.', 403);
        }

        $path = $this->ticketService->downloadPath($registration);

        if (! $path || ! is_file($path)) {
            throw new ApiException('A ticket has not been issued for this registration.', 404, errorCode: 'ticket_not_issued');
        }

        return response()
            ->download($path, 'duofest-ticket-'.$registration->ticket_number.'.pdf')
            ->setContentDisposition('inline', 'duofest-ticket-'.$registration->ticket_number.'.pdf');
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
