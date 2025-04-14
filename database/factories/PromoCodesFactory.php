<?php

namespace Database\Factories;

use App\Models\PromoCodes;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PromoCodes>
 */
class PromoCodesFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = PromoCodes::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $discountType = $this->faker->randomElement(['percentage', 'fixed']);
        $discountValue = $discountType === 'percentage'
            ? $this->faker->numberBetween(5, 50)
            : $this->faker->randomFloat(2, 5, 100);

        return [
            'code' => strtoupper($this->faker->bothify('??##??')),
            'description' => $this->faker->sentence(),
            'discount_type' => $discountType,
            'discount_value' => $discountValue,
            'start_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'end_date' => $this->faker->dateTimeBetween('now', '+3 months'),
            'max_uses' => $this->faker->randomElement([null, 10, 20, 50, 100]),
            'used_count' => 0,
            'min_cart_value' => $this->faker->randomElement([0, 10, 25, 50]),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the promo code is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'end_date' => $this->faker->dateTimeBetween('-3 months', '-1 day'),
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the promo code is for a specific percentage discount.
     */
    public function percentage(int $percentage = 25): static
    {
        return $this->state(fn (array $attributes) => [
            'discount_type' => 'percentage',
            'discount_value' => $percentage,
        ]);
    }

    /**
     * Indicate that the promo code is for a specific fixed amount discount.
     */
    public function fixedAmount(float $amount = 10.00): static
    {
        return $this->state(fn (array $attributes) => [
            'discount_type' => 'fixed',
            'discount_value' => $amount,
        ]);
    }
}
