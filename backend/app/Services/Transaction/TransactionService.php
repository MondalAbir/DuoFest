<?php

namespace App\Services\Transaction;

use App\Contracts\Services\TransactionServiceInterface;
use App\Enums\ActivityType;
use App\Enums\PaymentStatus;
use App\Models\Registration;
use App\Models\Transaction;
use App\Services\ActivityLog\ActivityLogService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

class TransactionService implements TransactionServiceInterface
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function record(Registration $registration, array $data): Transaction
    {
        $status = PaymentStatus::tryFrom($data['status'] ?? '') ?? PaymentStatus::PENDING;

        $transaction = $registration->transactions()->create([
            'event_id' => $registration->event_id,
            'user_id' => $registration->user_id,
            'amount' => $data['amount'],
            'currency' => strtoupper($data['currency'] ?? config('app.currency', 'USD')),
            'payment_method' => $data['payment_method'] ?? null,
            'reference' => $data['reference'] ?? null,
            'status' => $status->value,
            'paid_at' => $status === PaymentStatus::COMPLETED
                ? ($data['paid_at'] ?? now())
                : null,
        ]);

        $this->activityLog->record(
            subject: $transaction,
            type: ActivityType::PAYMENT_RECORDED,
            causer: request()->user(),
            description: "Recorded {$transaction->currency} {$transaction->amount} payment for {$registration->contactEmail()}",
            properties: ['transaction_id' => $transaction->getKey(), 'status' => $status->value],
        );

        return $transaction;
    }

    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return Transaction::query()
            ->with(['registration.event', 'user'])
            ->when($filters['event_id'] ?? null, fn ($query, $id) => $query->where('event_id', $id))
            ->when($filters['user_id'] ?? null, fn ($query, $id) => $query->where('user_id', $id))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['from'] ?? null, fn ($query, $date) => $query->whereDate('paid_at', '>=', Carbon::parse($date)))
            ->when($filters['to'] ?? null, fn ($query, $date) => $query->whereDate('paid_at', '<=', Carbon::parse($date)))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('reference', 'like', "%{$search}%"))
            ->orderByDesc('paid_at')
            ->orderByDesc('id')
            ->paginate((int) ($filters['per_page'] ?? config('api.per_page')));
    }
}
