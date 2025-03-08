<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssignmentSubmission>
 */
class AssignmentSubmissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $isGraded = fake()->boolean(70);

        return [
            'submission_text' => fake()->paragraphs(3, true),
            'file_path' => fake()->boolean(30) ? 'submissions/' . fake()->word() . '.pdf' : null,
            'score' => $isGraded ? fake()->numberBetween(0, 100) : null,
            'feedback' => $isGraded ? fake()->paragraph() : null,
            'submitted_at' => fake()->dateTimeBetween('-2 weeks', 'now'),
        ];
    }

    /**
     * Indicate that the submission has been graded.
     */
    public function graded(): static
    {
        return $this->state(fn (array $attributes) => [
            'score' => fake()->numberBetween(60, 100),
            'feedback' => fake()->paragraph(),
        ]);
    }
}
