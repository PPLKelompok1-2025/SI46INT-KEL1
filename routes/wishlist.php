<?php

use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    // Wishlist routes
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/courses/{course}/wishlist', [WishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('/courses/{course}/wishlist', [WishlistController::class, 'destroy'])->name('wishlist.destroy');
    Route::get('/courses/{course}/wishlist/check', [WishlistController::class, 'check'])->name('wishlist.check');
    Route::post('/courses/{course}/wishlist/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
});
