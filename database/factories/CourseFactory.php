<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(rand(3, 6));
        $price = fake()->randomElement([0, 99000, 149000, 199000, 299000, 499000]);

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'short_description' => fake()->sentence(),
            'description' => fake()->paragraphs(3, true),
            'price' => $price,
            'level' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
            'language' => fake()->randomElement(['English', 'Spanish', 'French', 'German']),
            'thumbnail' => 'courses/' . fake()->numberBetween(1, 10) . '.jpg',
            'is_published' => fake()->boolean(80),
            'is_featured' => fake()->boolean(20),
            'is_approved' => fake()->boolean(90),
            'requirements' => fake()->sentences(rand(3, 6)),
            'what_you_will_learn' => fake()->sentences(rand(4, 8)),
            'user_id' => User::factory()->instructor(),
            'category_id' => 1, // Will be overridden in seeder
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'updated_at' => function (array $attributes) {
                return fake()->dateTimeBetween($attributes['created_at'], 'now');
            },
        ];
    }

    /**
     * Indicate that the course is free.
     */
    public function free(): static
    {
        return $this->state(fn (array $attributes) => [
            'price' => 0,
        ]);
    }

    /**
     * Indicate that the course is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
            'is_published' => true,
            'is_approved' => true,
        ]);
    }
}
