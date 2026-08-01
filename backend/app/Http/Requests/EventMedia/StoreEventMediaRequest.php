<?php

namespace App\Http\Requests\EventMedia;

use App\Enums\EventMediaType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manageMedia', $this->route('event')) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'image' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
            'type' => ['required', Rule::enum(EventMediaType::class)],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
