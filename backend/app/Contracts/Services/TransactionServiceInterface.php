<?php

namespace App\Contracts\Services;

use App\Models\Registration;
use App\Models\Transaction;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface TransactionServiceInterface
{
    /**
     * Record a payment against a registration.
     *
     * @param  array<string, mixed>  $data
     */
    public function record(Registration $registration, array $data): Transaction;

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator;
}
