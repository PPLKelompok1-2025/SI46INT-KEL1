<?php

use App\Http\Controllers\DiscussionController;
use App\Http\Controllers\DiscussionReplyController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    // Discussion routes
    Route::get('/courses/{course}/discussions', [DiscussionController::class, 'index'])->name('discussions.index');
    Route::get('/courses/{course}/discussions/create', [DiscussionController::class, 'create'])->name('discussions.create');
    Route::post('/courses/{course}/discussions', [DiscussionController::class, 'store'])->name('discussions.store');
    Route::get('/courses/{course}/discussions/{discussion}', [DiscussionController::class, 'show'])->name('discussions.show');
    Route::get('/courses/{course}/discussions/{discussion}/edit', [DiscussionController::class, 'edit'])->name('discussions.edit');
    Route::put('/courses/{course}/discussions/{discussion}', [DiscussionController::class, 'update'])->name('discussions.update');
    Route::delete('/courses/{course}/discussions/{discussion}', [DiscussionController::class, 'destroy'])->name('discussions.destroy');
    Route::put('/courses/{course}/discussions/{discussion}/pin', [DiscussionController::class, 'togglePin'])->name('discussions.pin');
    Route::put('/courses/{course}/discussions/{discussion}/lock', [DiscussionController::class, 'toggleLock'])->name('discussions.lock');
    
    // Discussion reply routes
    Route::post('/courses/{course}/discussions/{discussion}/replies', [DiscussionReplyController::class, 'store'])->name('discussion.replies.store');
    Route::get('/courses/{course}/discussions/{discussion}/replies/{reply}/edit', [DiscussionReplyController::class, 'edit'])->name('discussion.replies.edit');
    Route::put('/courses/{course}/discussions/{discussion}/replies/{reply}', [DiscussionReplyController::class, 'update'])->name('discussion.replies.update');
    Route::delete('/courses/{course}/discussions/{discussion}/replies/{reply}', [DiscussionReplyController::class, 'destroy'])->name('discussion.replies.destroy');
    Route::put('/courses/{course}/discussions/{discussion}/replies/{reply}/solution', [DiscussionReplyController::class, 'markAsSolution'])->name('discussion.replies.solution');
    Route::delete('/courses/{course}/discussions/{discussion}/replies/{reply}/solution', [DiscussionReplyController::class, 'unmarkAsSolution'])->name('discussion.replies.unsolution');
});