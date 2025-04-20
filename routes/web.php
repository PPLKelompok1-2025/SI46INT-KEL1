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

// Authenticated user routes
Route::middleware(['auth'])->group(function () {
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Enrollment routes
    Route::get('/enrollments', [EnrollmentController::class, 'index'])->name('enrollments.index');
    Route::post('/courses/{course}/enroll', [EnrollmentController::class, 'store'])->name('enrollments.store');
    Route::get('/enrollments/{enrollment}', [EnrollmentController::class, 'show'])->name('enrollments.show');

    // Transaction routes
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::get('/courses/{course}/checkout', [TransactionController::class, 'create'])->name('transactions.create');
    Route::post('/courses/{course}/checkout', [TransactionController::class, 'store'])->name('transactions.store');

    // Review routes
    Route::get('/courses/{course}/reviews', [ReviewController::class, 'index'])->name('reviews.index');
    Route::get('/courses/{course}/reviews/create', [ReviewController::class, 'create'])->name('reviews.create');
    Route::post('/courses/{course}/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    Route::get('/courses/{course}/reviews/{review}/edit', [ReviewController::class, 'edit'])->name('reviews.edit');
    Route::put('/courses/{course}/reviews/{review}', [ReviewController::class, 'update'])->name('reviews.update');
    Route::delete('/courses/{course}/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');

    // Lesson progress routes
    Route::post('/lessons/{lesson}/complete', [LessonProgressController::class, 'markAsCompleted'])->name('lessons.complete');
    Route::post('/lessons/{lesson}/watch-time', [LessonProgressController::class, 'updateWatchTime'])->name('lessons.watch-time');
    Route::get('/courses/{course}/progress', [LessonProgressController::class, 'getCourseProgress'])->name('courses.progress');

    // Instructor routes
    Route::middleware(['can:create,App\\Models\\Course'])->group(function () {
        Route::get('/instructor/courses', [CourseController::class, 'myCourses'])->name('instructor.courses');
        Route::get('/instructor/courses/create', [CourseController::class, 'create'])->name('courses.create');
        Route::post('/instructor/courses', [CourseController::class, 'store'])->name('courses.store');
        Route::get('/instructor/courses/{course}/edit', [CourseController::class, 'edit'])->name('courses.edit');
        Route::put('/instructor/courses/{course}', [CourseController::class, 'update'])->name('courses.update');
        Route::delete('/instructor/courses/{course}', [CourseController::class, 'destroy'])->name('courses.destroy');
    });
});

// Admin routes
Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/users', [AdminController::class, 'users'])->name('admin.users');
    Route::get('/courses', [AdminController::class, 'courses'])->name('admin.courses');
    Route::put('/courses/{course}/toggle-featured', [AdminController::class, 'toggleFeatured'])->name('admin.courses.toggle-featured');
    Route::get('/transactions', [AdminController::class, 'transactions'])->name('admin.transactions');
    Route::get('/reviews', [AdminController::class, 'reviews'])->name('admin.reviews');
    Route::put('/reviews/{review}/approve', [AdminController::class, 'approveReview'])->name('admin.reviews.approve');
});
Route::middleware(['auth', 'verified'])->group(function () {
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

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
