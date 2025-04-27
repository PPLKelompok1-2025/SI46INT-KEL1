<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Enrollment>
 */
class EnrollmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $enrolledAt = fake()->dateTimeBetween('-6 months', 'now');
        $completedAt = fake()->boolean(30) ? fake()->dateTimeBetween($enrolledAt, 'now') : null;
        $progress = $completedAt ? 100 : fake()->numberBetween(0, 99);

        return [
            'enrolled_at' => $enrolledAt,
            'completed_at' => $completedAt,
            'progress' => $progress,
        ];
    }

    /**
     * Indicate that the enrollment is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed_at' => fake()->dateTimeBetween($attributes['enrolled_at'] ?? '-3 months', 'now'),
            'progress' => 100,
        ]);
    }
}
