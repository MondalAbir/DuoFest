<?php

namespace App\Http\Requests\CollegeAdmin;

use Illuminate\Foundation\Http\FormRequest;

class AssignCollegeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('assignCollege', $this->route('user'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'college_id' => ['required', 'integer', 'exists:colleges,id'],
        ];
    }
}
