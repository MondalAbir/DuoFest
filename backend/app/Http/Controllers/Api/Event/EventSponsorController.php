<?php

namespace App\Http\Controllers\Api\Event;

use App\Contracts\Services\EventSponsorServiceInterface;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\EventSponsor\StoreEventSponsorRequest;
use App\Http\Requests\EventSponsor\UpdateEventSponsorRequest;
use App\Http\Resources\EventSponsorResource;
use App\Models\Event;
use App\Models\EventSponsor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventSponsorController extends ApiController
{
    public function __construct(
        private readonly EventSponsorServiceInterface $sponsorService,
    ) {}

    public function index(Request $request, Event $event): JsonResponse
    {
        $sponsors = $this->sponsorService->paginate($event, $request->only([
            'search', 'tier', 'per_page',
        ]));

        return $this->paginated(EventSponsorResource::collection($sponsors));
    }

    public function store(StoreEventSponsorRequest $request, Event $event): JsonResponse
    {
        $sponsor = $this->sponsorService->store($event, $request->validated());

        return $this->created(new EventSponsorResource($sponsor), 'Sponsor added successfully.');
    }

    public function update(UpdateEventSponsorRequest $request, Event $event, EventSponsor $sponsor): JsonResponse
    {
        $sponsor = $this->sponsorService->update($sponsor, $request->validated());

        return $this->success(new EventSponsorResource($sponsor), 'Sponsor updated successfully.');
    }

    public function destroy(Event $event, EventSponsor $sponsor): JsonResponse
    {
        $this->sponsorService->delete($sponsor);

        return $this->success(null, 'Sponsor removed successfully.');
    }
}
