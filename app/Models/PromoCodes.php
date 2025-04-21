<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromoCodes extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'description',
        'discount_type',
        'discount_value',
        'start_date',
        'end_date',
        'max_uses',
        'used_count',
        'min_cart_value',
        'is_active',
    ];

    protected $casts = [
        'discount_value' => 'float',
        'max_uses' => 'integer',
        'used_count' => 'integer',
        'min_cart_value' => 'float',
        'is_active' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    /**
     * Get the transactions that used this promo code
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'promo_code_id');
    }

    /**
     * Check if the promo code is valid
     */
    public function isValid($cartValue = 0)
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();
        if ($this->start_date && $now->lt($this->start_date)) {
            return false;
        }
        if ($this->end_date && $now->gt($this->end_date)) {
            return false;
        }

        if ($this->max_uses && $this->used_count >= $this->max_uses) {
            return false;
        }

        if ($this->min_cart_value && $cartValue < $this->min_cart_value) {
            return false;
        }

        return true;
    }

    /**
     * Calculate the discount amount
     */
    public function calculateDiscount($amount)
    {
        if (!$this->isValid($amount)) {
            return 0;
        }

        if ($this->discount_type === 'percentage') {
            return round(($amount * $this->discount_value) / 100, 2);
        }

        if ($this->discount_type === 'fixed') {
            return min($this->discount_value, $amount);
        }

        return 0;
    }

    /**
     * Increase the used count
     */
    public function incrementUsage()
    {
        $this->increment('used_count');
    }
}
