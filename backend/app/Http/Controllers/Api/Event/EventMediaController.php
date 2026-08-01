<?php

namespace App\Http\Controllers\Api\Event;

use App\Contracts\Services\EventMediaServiceInterface;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\EventMedia\StoreEventMediaRequest;
use App\Http\Resources\EventMediaResource;
use App\Models\Event;
use App\Models\EventMedia;
use Illuminate\Http\JsonResponse;

class EventMediaController extends ApiController
{
    public function __construct(
        private readonly EventMediaServiceInterface $mediaService,
    ) {}

    public function index(Event $event): JsonResponse
    {
        return $this->success(EventMediaResource::collection($this->mediaService->forEvent($event)));
    }

    public function store(StoreEventMediaRequest $request, Event $event): JsonResponse
    {
        $media = $this->mediaService->store($event, $request->validated());

        return $this->created(new EventMediaResource($media), 'Media uploaded successfully.');
    }

    public function destroy(Event $event, EventMedia $media): JsonResponse
    {
        $this->mediaService->delete($media);

        return $this->success(null, 'Media removed successfully.');
    }
}
