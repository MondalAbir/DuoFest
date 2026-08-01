<?php

namespace App\Http\Requests\Event;

use App\Enums\EventStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('event.update') ?? false;
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
            'is_featured' => ['sometimes', 'boolean'],
            'cover_image_url' => ['nullable', 'url', 'max:2048'],
            'status' => ['sometimes', Rule::enum(EventStatus::class)],
        ];
    }
}
