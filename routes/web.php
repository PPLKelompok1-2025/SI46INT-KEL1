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

Route::middleware(['auth', 'verified'])->group(function () {
    // Common authenticated routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('profile/photo', [ProfileController::class, 'updatePhoto'])->name('profile.photo');

    // Student routes
    Route::middleware(['role:student'])->prefix('student')->name('student.')->group(function () {
        Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('dashboard');

        // Course enrollment and learning
        Route::get('/courses', [StudentCourseController::class, 'index'])->name('courses.index');
        Route::get('/courses/{course:slug}', [StudentCourseController::class, 'show'])->name('courses.show');
        Route::post('/courses/{course}/enroll', [EnrollmentController::class, 'enroll'])->name('courses.enroll');
        Route::get('/courses/{course}/learn', [StudentCourseController::class, 'learn'])->name('courses.learn');
        Route::get('/courses/{course}/lessons/{lesson}', [StudentCourseController::class, 'lesson'])->name('courses.lessons.show');
        Route::post('/courses/{course}/complete', [EnrollmentController::class, 'complete'])->name('courses.complete');
        Route::post('/lessons/{lesson}/complete', [EnrollmentController::class, 'completeLesson'])->name('lessons.complete');
        Route::post('/courses/{course}/review', [StudentCourseController::class, 'review'])->name('courses.review');
        Route::put('/courses/{course}/review/{review}', [StudentCourseController::class, 'updateReview'])->name('courses.review.update');
        Route::delete('/courses/{course}/review/{review}', [StudentCourseController::class, 'deleteReview'])->name('courses.review.delete');

        // Video streaming route for students
        Route::get('/lessons/{lesson}/video', [StudentCourseController::class, 'streamVideo'])->name('lessons.videos.stream');

        // Wishlist routes
        Route::get('/wishlist', [StudentCourseController::class, 'wishlist'])->name('wishlist');
        Route::post('/courses/{course}/wishlist', [StudentCourseController::class, 'toggleWishlist'])->name('courses.wishlist.toggle');
    });

    // Instructor routes
    Route::middleware(['role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
        Route::get('/dashboard', [InstructorDashboardController::class, 'index'])->name('dashboard');

        // Course management
        Route::resource('courses', InstructorCourseController::class);
        Route::patch('/courses/{course}/publish', [InstructorCourseController::class, 'togglePublish'])->name('courses.publish');

        // Earnings routes
        Route::get('/earnings', [EarningController::class, 'index'])->name('earnings.index');
        Route::get('/earnings/withdraw', [EarningController::class, 'withdrawForm'])->name('earnings.withdraw');
        Route::post('/earnings/withdraw', [EarningController::class, 'requestWithdrawal'])->name('earnings.request-withdrawal');
        Route::get('/earnings/courses/{course}', [EarningController::class, 'courseEarnings'])->name('earnings.course');
    });

    // Admin routes
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        // Analytics routes
        Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

        // User management
        Route::resource('users', UserController::class);
        Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');

        // Course management
        Route::resource('courses', AdminCourseController::class);
        Route::patch('/courses/{course}/approve', [AdminCourseController::class, 'approve'])->name('courses.approve');
        Route::patch('/courses/{course}/feature', [AdminCourseController::class, 'feature'])->name('courses.feature');

        // Transaction management
        Route::get('/transactions/export', [AdminTransactionController::class, 'export'])->name('transactions.export');
        Route::resource('transactions', AdminTransactionController::class)->only(['index', 'show']);
        Route::post('/transactions/{transaction}/refund', [AdminTransactionController::class, 'refund'])->name('transactions.refund');
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
