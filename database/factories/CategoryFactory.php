<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(rand(1, 2), true);
        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'parent_id' => null,
            'icon' => fake()->randomElement(['BookOpen', 'Code', 'BarChart', 'Camera', 'Music', 'Heart', 'Briefcase']),
        ];
    }

    /**
     * Indicate that the category is a subcategory.
     */
    public function subcategory(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'parent_id' => 1, // Will be overridden in seeder
            ];
        });
    }
}
