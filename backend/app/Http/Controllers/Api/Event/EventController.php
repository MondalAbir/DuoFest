<?php

namespace App\Http\Controllers\Api\Event;

use App\Contracts\Services\EventServiceInterface;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Event\StoreEventRequest;
use App\Http\Requests\Event\UpdateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends ApiController
{
    public function __construct(
        private readonly EventServiceInterface $eventService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search', 'college_id', 'category_id', 'status', 'is_featured',
            'upcoming', 'ongoing', 'completed', 'phase', 'per_page',
        ]);

        $isAdmin = $request->user()?->can('event.view_any') ?? false;

        $events = $this->eventService->paginate($filters, $isAdmin);

        return $this->paginated(EventResource::collection($events));
    }

    /**
     * Public feed of featured events.
     */
    public function featured(Request $request): JsonResponse
    {
        $events = $this->eventService->featured($this->publicFilters($request));

        return $this->paginated(EventResource::collection($events));
    }

    /**
     * Public feed of upcoming events.
     */
    public function upcoming(Request $request): JsonResponse
    {
        $events = $this->eventService->upcoming($this->publicFilters($request));

        return $this->paginated(EventResource::collection($events));
    }

    /**
     * Public full-text search.
     */
    public function search(Request $request): JsonResponse
    {
        $events = $this->eventService->search((string) $request->query('q', ''), $this->publicFilters($request));

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
        $this->guardVisible($request, $event);

        return $this->success(new EventResource(
            $event->load(['college', 'organizer', 'category', 'banner', 'gallery', 'sponsors']),
        ));
    }

    public function showBySlug(Request $request, string $slug): JsonResponse
    {
        $event = $this->eventService->findBySlug($slug);

        $this->guardVisible($request, $event);

        return $this->success(new EventResource($event));
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

    public function archive(Event $event): JsonResponse
    {
        return $this->success(new EventResource($this->eventService->archive($event)), 'Event archived successfully.');
    }

    public function unarchive(Event $event): JsonResponse
    {
        return $this->success(new EventResource($this->eventService->unarchive($event)), 'Event unarchived successfully.');
    }

    /**
     * @return array<string, mixed>
     */
    private function publicFilters(Request $request): array
    {
        return $request->only(['college_id', 'category_id', 'per_page']);
    }

    private function guardVisible(Request $request, Event $event): void
    {
        $isAdmin = $request->user()?->can('event.view_any') ?? false;

        if (! $event->isVisible() && ! $isAdmin) {
            throw new ModelNotFoundException;
        }
    }
}
