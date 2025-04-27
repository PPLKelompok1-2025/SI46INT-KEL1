<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Certificate>
 */
class CertificateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $issuedAt = fake()->dateTimeBetween('-3 months', 'now');

        return [
            'certificate_number' => 'CERT-' . Str::upper(Str::random(8)),
            'issued_at' => $issuedAt,
            'pdf_path' => 'certificates/' . Str::random(40) . '.pdf',
            'created_at' => $issuedAt,
            'updated_at' => $issuedAt,
        ];
    }
}
