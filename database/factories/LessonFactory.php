<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lesson>
 */
class LessonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(rand(3, 8));
        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'description' => fake()->paragraph(),
            'video_url' => 'https://www.youtube.com/watch?v=' . Str::random(11),
            'content' => fake()->paragraphs(rand(3, 6), true),
            'duration' => rand(5, 60),
            'order' => rand(1, 20),
            'is_free' => fake()->boolean(20),
            'is_published' => fake()->boolean(90),
            'section' => fake()->randomElement(['Introduction', 'Basics', 'Advanced Topics', 'Projects', 'Conclusion']),
        ];
    }

    /**
     * Indicate that the lesson is free.
     */
    public function free(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_free' => true,
        ]);
    }
}
