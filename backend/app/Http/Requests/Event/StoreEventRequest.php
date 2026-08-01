<?php

namespace App\Http\Requests\Event;

use App\Enums\EventStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('event.create') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'college_id' => ['required', 'integer', 'exists:colleges,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'venue' => ['nullable', 'string', 'max:255'],
            'starts_at' => ['required', 'date', 'after_or_equal:now'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
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
            $open = $this->input('registration_open_at');
            $closes = $this->input('registration_closes_at');

            if ($open && $closes && strtotime((string) $closes) <= strtotime((string) $open)) {
                $validator->errors()->add('registration_closes_at', 'The registration closes at must be after the registration opens at.');
            }
        });
    }
}
