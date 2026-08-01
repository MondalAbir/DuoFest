<?php

namespace App\Http\Requests\Volunteer;

use App\Enums\Permission;
use Illuminate\Foundation\Http\FormRequest;

class StoreVolunteerSlotRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'capacity' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
