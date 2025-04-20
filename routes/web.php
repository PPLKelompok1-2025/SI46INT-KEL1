<?php

use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\Instructor\AssignmentController as InstructorAssignmentController;
use App\Http\Controllers\Instructor\CourseController as InstructorCourseController;
use App\Http\Controllers\Instructor\DashboardController as InstructorDashboardController;
use App\Http\Controllers\Instructor\EarningController;
use App\Http\Controllers\Instructor\LessonController;
use App\Http\Controllers\Instructor\QuizController as InstructorQuizController;
use App\Http\Controllers\Instructor\QuestionController;
use App\Http\Controllers\Instructor\StudentController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\MidtransController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Student\AssignmentController as StudentAssignmentController;
use App\Http\Controllers\Student\CertificateController;
use App\Http\Controllers\Student\CourseController as StudentCourseController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\EnrollmentController;
use App\Http\Controllers\Student\NoteController as StudentNoteController;
use App\Http\Controllers\Student\QuizController as StudentQuizController;
use App\Http\Controllers\Instructor\ReviewController as InstructorReviewController;
use App\Http\Controllers\Admin\PromoCodeController as AdminPromoCodeController;
use App\Http\Controllers\PromoCodeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LandingController::class, 'index'])->name('home');
Route::get('/quick-search', [LandingController::class, 'search'])->name('quick-search');

// Public routes
Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
Route::get('/courses/{course:slug}', [CourseController::class, 'show'])->name('courses.show');

// Categories routes
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/categories/{category:slug}', [CategoryController::class, 'show'])->name('categories.show');

// Instructor routes
Route::middleware(['role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
    // Lesson routes - nested under courses
    Route::get('courses/{course}/lessons', [LessonController::class, 'index'])->name('courses.lessons.index');
    Route::get('courses/{course}/lessons/create', [LessonController::class, 'create'])->name('courses.lessons.create');
    Route::get('courses/{course}/lessons/{lesson}/edit', [LessonController::class, 'edit'])->name('courses.lessons.edit');
    Route::delete('courses/{course}/lessons/{lesson}', [LessonController::class, 'destroy'])->name('courses.lessons.destroy');
    Route::post('courses/{course}/lessons', [LessonController::class, 'store'])->name('courses.lessons.store');
    Route::get('courses/{course}/lessons/{lesson}', [LessonController::class, 'show'])->name('courses.lessons.show');

    // Video handling routes
    Route::post('lessons/videos/upload', [LessonController::class, 'uploadTemporaryVideo'])->name('lessons.videos.upload');
    Route::post('lessons/videos/delete', [LessonController::class, 'deleteTemporaryVideo'])->name('lessons.videos.delete');
    Route::get('lessons/{lesson}/video', [LessonController::class, 'streamVideo'])->name('lessons.videos.stream');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Common authenticated routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('profile/photo', [ProfileController::class, 'updatePhoto'])->name('profile.photo');

    // Instructor routes
    Route::middleware('can:create,App\\Models\\Course')->prefix('instructor')->name('instructor.')->group(function () {
        Route::get('/courses', [CourseController::class, 'myCourses'])->name('courses.index');
        Route::get('/courses/create', [CourseController::class, 'create'])->name('courses.create');
        Route::post('/courses', [CourseController::class, 'store'])->name('courses.store');
        Route::get('/courses/{course}/edit', [CourseController::class, 'edit'])->name('courses.edit');
        Route::put('/courses/{course}', [CourseController::class, 'update'])->name('courses.update');
        Route::delete('/courses/{course}', [CourseController::class, 'destroy'])->name('courses.destroy');
    });

    // Student enrollment routes
    Route::get('/enrollments', [EnrollmentController::class, 'index'])->name('enrollments.index');
    Route::post('/courses/{course}/enroll', [EnrollmentController::class, 'store'])->name('enrollments.store');
    Route::get('/enrollments/{enrollment}', [EnrollmentController::class, 'show'])->name('enrollments.show');
    Route::patch('/enrollments/{enrollment}', [EnrollmentController::class, 'update'])->name('enrollments.update');

    // Transaction routes
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::get('/courses/{course}/checkout', [TransactionController::class, 'create'])->name('transactions.create');
    Route::post('/courses/{course}/checkout', [TransactionController::class, 'store'])->name('transactions.store');
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
});

// Midtrans payment notification webhook (no auth required)
Route::post('/payment/notification', [TransactionController::class, 'notification'])->name('transactions.notification');

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
require __DIR__.'/discussion.php';
require __DIR__.'/certificate.php';
require __DIR__.'/wishlist.php';
