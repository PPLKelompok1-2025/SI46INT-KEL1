<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'rating' => fake()->numberBetween(3, 5),
            'comment' => fake()->paragraph(rand(1, 3)),
            'is_approved' => fake()->boolean(90),
            'created_at' => fake()->dateTimeBetween('-6 months', 'now'),
        ];
    }
}
