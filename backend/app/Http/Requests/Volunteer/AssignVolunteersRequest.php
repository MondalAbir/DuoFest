<?php

namespace App\Http\Requests\Volunteer;

use Illuminate\Foundation\Http\FormRequest;

class AssignVolunteersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('volunteer.update') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'user_ids' => ['required', 'array', 'min:1', 'max:100'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ];
    }
}
