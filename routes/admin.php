<?php

use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

// All routes in this file are prefixed with 'admin' and require admin role
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Admin dashboard
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');

    // User management
    Route::get('/users', [AdminController::class, 'users'])->name('users.index');
    Route::get('/users/{user}', [AdminController::class, 'showUser'])->name('users.show');
    Route::patch('/users/{user}', [AdminController::class, 'updateUser'])->name('users.update');

    // Course management
    Route::get('/courses', [AdminController::class, 'courses'])->name('courses.index');
    Route::post('/courses/{course}/toggle-featured', [AdminController::class, 'toggleFeatured'])->name('courses.toggle-featured');

    // Transaction management
    Route::get('/transactions', [AdminController::class, 'transactions'])->name('transactions.index');

    // Review management
    Route::get('/reviews', [AdminController::class, 'reviews'])->name('reviews.index');
    Route::post('/reviews/{review}/approve', [AdminController::class, 'approveReview'])->name('reviews.approve');
});
