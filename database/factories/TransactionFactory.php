<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $paidAt = fake()->dateTimeBetween('-6 months', 'now');

        return [
            'transaction_id' => 'txn_' . Str::random(24),
            'amount' => fake()->randomElement([19.99, 29.99, 49.99, 99.99]),
            'currency' => 'USD',
            'payment_method' => fake()->randomElement(['credit_card', 'paypal', 'stripe']),
            'status' => 'completed',
            'paid_at' => $paidAt,
            'created_at' => $paidAt,
            'updated_at' => $paidAt,
        ];
    }
}
