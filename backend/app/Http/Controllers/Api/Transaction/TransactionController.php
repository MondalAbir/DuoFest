<?php

namespace App\Http\Controllers\Api\Transaction;

use App\Contracts\Services\TransactionServiceInterface;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Transaction\RecordTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Event;
use App\Models\Registration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends ApiController
{
    public function __construct(
        private readonly TransactionServiceInterface $transactionService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $transactions = $this->transactionService->paginate($request->only([
            'event_id', 'user_id', 'status', 'from', 'to', 'search', 'per_page',
        ]));

        return $this->paginated(TransactionResource::collection($transactions));
    }

    /**
     * Record a payment against a registration.
     */
    public function store(RecordTransactionRequest $request, Event $event, Registration $registration): JsonResponse
    {
        if ($registration->event_id !== $event->id) {
            return $this->error('This registration does not belong to the given event.', 422);
        }

        $transaction = $this->transactionService->record($registration, $request->validated());

        return $this->created(
            new TransactionResource($transaction->load(['registration.event', 'user'])),
            'Payment recorded successfully.',
        );
    }
}
