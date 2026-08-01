<?php

namespace App\Http\Controllers\Api\Event;

use App\Contracts\Services\EventServiceInterface;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Event\StoreEventRequest;
use App\Http\Requests\Event\UpdateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends ApiController
{
    public function __construct(
        private readonly EventServiceInterface $eventService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'college_id', 'status', 'is_featured', 'upcoming', 'per_page']);

        $events = $this->eventService->paginate($filters);

        return $this->paginated(EventResource::collection($events));
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['organizer_id'] ??= $request->user()?->getKey();

        $event = $this->eventService->create($data);

        return $this->created(new EventResource($event), 'Event created successfully.');
    }

    public function show(Request $request, Event $event): JsonResponse
    {
        return $this->success(new EventResource($event->load(['college', 'organizer'])));
    }

    public function showBySlug(Request $request, string $slug): JsonResponse
    {
        return $this->success(new EventResource($this->eventService->findBySlug($slug)));
    }

    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        $event = $this->eventService->update($event, $request->validated());

        return $this->success(new EventResource($event), 'Event updated successfully.');
    }

    public function destroy(Event $event): JsonResponse
    {
        $this->eventService->delete($event);

        return $this->success(null, 'Event deleted successfully.');
    }

    public function publish(Event $event): JsonResponse
    {
        return $this->success(new EventResource($this->eventService->publish($event)), 'Event published successfully.');
    }

    public function unpublish(Event $event): JsonResponse
    {
        return $this->success(new EventResource($this->eventService->unpublish($event)), 'Event unpublished successfully.');
    }
}
