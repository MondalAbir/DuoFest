<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;

class EmailCertificatesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manageCertificates', $this->route('event')) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'certificate_ids' => ['nullable', 'array', 'min:1'],
            'certificate_ids.*' => ['integer', 'exists:certificates,id'],
        ];
    }
}
