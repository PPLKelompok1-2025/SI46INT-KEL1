<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Note>
 */
class NoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content' => '<h2>' . fake()->sentence() . '</h2><p>' . fake()->paragraph() . '</p><ul><li>' . implode('</li><li>', fake()->sentences(3)) . '</li></ul><p>' . fake()->paragraph() . '</p>',
            'created_at' => fake()->dateTimeBetween('-3 months', 'now'),
            'updated_at' => function (array $attributes) {
                return fake()->dateTimeBetween($attributes['created_at'], 'now');
            },
        ];
    }
}
