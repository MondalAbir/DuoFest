<?php

namespace App\Http\Requests\Volunteer;

use App\Enums\Permission;
use App\Enums\VolunteerStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVolunteerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(Permission::VOLUNTEER_CREATE->value) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'role' => ['sometimes', 'nullable', 'string', 'max:255'],
            'shift_start_at' => ['sometimes', 'nullable', 'date'],
            'shift_end_at' => ['sometimes', 'nullable', 'date', 'after:shift_start_at'],
            'hours_volunteered' => ['sometimes', 'numeric', 'min:0', 'max:999.99'],
            'status' => ['sometimes', Rule::enum(VolunteerStatus::class)],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }
}
