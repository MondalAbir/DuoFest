<?php

namespace Database\Factories;

use App\Enums\CertificateStatus;
use App\Models\Certificate;
use App\Models\Registration;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Certificate>
 */
class CertificateFactory extends Factory
{
    protected $model = Certificate::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'registration_id' => Registration::factory(),
            'user_id' => function (array $attributes) {
                return Registration::find($attributes['registration_id'])->user_id;
            },
            'certificate_number' => Certificate::generateCertificateNumber(),
            'template' => 'default',
            'file_path' => null,
            'status' => CertificateStatus::ISSUED->value,
            'issued_at' => now(),
            'expires_at' => null,
        ];
    }
}
