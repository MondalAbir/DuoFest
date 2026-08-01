<?php

namespace App\Http\Requests\CollegeAdmin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class InviteCollegeAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('invite', User::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'college_id' => ['nullable', 'integer', 'exists:colleges,id'],
        ];
    }
}
