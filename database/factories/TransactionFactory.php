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
        $amount = fake()->randomElement([99000, 149000, 199000, 299000, 499000]);

        $instructorAmount = round($amount * 0.7, 0);

        return [
            'transaction_id' => 'txn_' . Str::random(24),
            'amount' => $amount,
            'instructor_amount' => $instructorAmount,
            'currency' => 'IDR',
            'payment_method' => fake()->randomElement(['credit_card', 'paypal', 'stripe']),
            'status' => 'completed',
            'paid_at' => $paidAt,
            'created_at' => $paidAt,
            'updated_at' => $paidAt,
        ];
    }
}
