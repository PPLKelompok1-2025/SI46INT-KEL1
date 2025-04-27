<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Assignment>
 */
class AssignmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'description' => fake()->paragraphs(2, true),
            'points' => fake()->randomElement([10, 20, 25, 50, 100]),
            'due_date' => fake()->dateTimeBetween('+1 week', '+4 weeks'),
            // Note: lesson_id will be set in the seeder
        ];
    }
}
