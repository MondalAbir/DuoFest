<?php

namespace App\Http\Requests\Volunteer;

use App\Enums\Permission;
use Illuminate\Foundation\Http\FormRequest;

class AssignVolunteersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(Permission::VOLUNTEER_UPDATE->value) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'user_ids' => ['required', 'array', 'min:1', 'max:100'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'role' => ['sometimes', 'nullable', 'string', 'max:255'],
            'shift_start_at' => ['sometimes', 'nullable', 'date'],
            'shift_end_at' => ['sometimes', 'nullable', 'date', 'after:shift_start_at'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }
}
