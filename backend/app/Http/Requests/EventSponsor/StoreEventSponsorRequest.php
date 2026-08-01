<?php

namespace App\Http\Requests\EventSponsor;

use App\Enums\SponsorTier;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventSponsorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manageSponsors', $this->route('event')) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'logo_url' => ['nullable', 'url', 'max:2048'],
            'website_url' => ['nullable', 'url', 'max:2048'],
            'tier' => ['nullable', Rule::enum(SponsorTier::class)],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
