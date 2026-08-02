<?php

namespace App\Http\Requests\Transaction;

use App\Enums\PaymentStatus;
use App\Enums\Permission;
use Illuminate\Foundation\Http\FormRequest;

class RecordTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(Permission::PAYMENT_CREATE->value) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0.01', 'max:99999999.99'],
            'currency' => ['nullable', 'string', 'size:3'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'reference' => ['nullable', 'string', 'max:191'],
            'status' => ['nullable', 'string', 'in:'.implode(',', PaymentStatus::values())],
            'paid_at' => ['nullable', 'date'],
        ];
    }
}
