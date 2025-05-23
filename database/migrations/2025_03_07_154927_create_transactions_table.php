<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('transaction_id');
            $table->decimal('amount', 8, 2);
            $table->string('currency')->default('IDR');
            $table->string('payment_method');
            $table->string('status'); // completed, pending, failed, refunded
            $table->timestamp('paid_at')->nullable();
            $table->string('type'); // purchase, refund, payout
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
