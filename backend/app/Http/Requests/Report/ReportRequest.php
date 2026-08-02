<?php

namespace App\Http\Requests\Report;

use App\Enums\Permission;
use Illuminate\Foundation\Http\FormRequest;

class ReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(Permission::REPORT_VIEW_ANY->value) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'college_id' => ['nullable', 'integer', 'exists:colleges,id'],
            'status' => ['nullable', 'string', 'max:50'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'format' => ['nullable', 'string', 'in:csv,pdf'],
        ];
    }
}
