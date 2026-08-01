<?php

namespace App\Http\Requests\College;

use Illuminate\Foundation\Http\FormRequest;

class InviteCollegeAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('inviteAdmin', $this->route('college'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.email' => 'Please provide a valid email address.',
        ];
    }
}
