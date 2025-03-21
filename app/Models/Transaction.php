<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'transaction_id',
        'amount',
        'instructor_amount',
        'currency',
        'payment_method',
        'status',
        'paid_at',
        'type',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the transaction type based on available data.
     *
     * @return string
     */
    public function getTypeAttribute()
    {
        if (isset($this->attributes['type'])) {
            return $this->attributes['type'];
        }

        if ($this->status === 'refunded') {
            return 'refund';
        }

        if ($this->instructor_amount > 0 && empty($this->course_id)) {
            return 'payout';
        }

        return 'purchase';
    }

    /**
     * Get the promo code used for this transaction.
     */
    public function promoCode()
    {
        return $this->belongsTo(PromoCodes::class, 'promo_code_id');
    }
}
