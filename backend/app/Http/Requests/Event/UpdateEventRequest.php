<?php

namespace App\Http\Requests\Event;

use App\Enums\EventStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('event')) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'college_id' => ['sometimes', 'integer', 'exists:colleges,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'venue' => ['nullable', 'string', 'max:255'],
            'starts_at' => ['sometimes', 'date'],
            'ends_at' => ['sometimes', 'date', 'after:starts_at'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'requires_approval' => ['sometimes', 'boolean'],
            'registration_enabled' => ['sometimes', 'boolean'],
            'registration_open_at' => ['nullable', 'date'],
            'registration_closes_at' => ['nullable', 'date'],
            'is_featured' => ['sometimes', 'boolean'],
            'cover_image_url' => ['nullable', 'url', 'max:2048'],
            'status' => ['sometimes', Rule::enum(EventStatus::class)],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $event = $this->route('event');
            $open = $this->input('registration_open_at', $event?->registration_open_at?->toISOString());
            $closes = $this->input('registration_closes_at', $event?->registration_closes_at?->toISOString());

            if ($open && $closes && strtotime((string) $closes) <= strtotime((string) $open)) {
                $validator->errors()->add('registration_closes_at', 'The registration closes at must be after the registration opens at.');
            }
        });
    }
}
