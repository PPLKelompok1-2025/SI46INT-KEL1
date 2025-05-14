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

    // Payment routes
    Route::prefix('payment')->name('payment.')->group(function () {
        // Route::post('/process', [PaymentController::class, 'process'])->name('process');
        // Route::get('/success', [PaymentController::class, 'success'])->name('success');
        // Route::get('/cancel', [PaymentController::class, 'cancel'])->name('cancel');

        Route::get('/checkout/{course}', [CourseController::class, 'checkout'])->name('checkout');

        // Midtrans payment routes
        Route::post('/validate-promo', [PromoCodeController::class, 'validatePromoCode'])->name('validate-promo');

        Route::post('/midtrans/token/{course}', [MidtransController::class, 'getSnapToken'])->name('midtrans.token');
        Route::post('/midtrans/notification', [MidtransController::class, 'handleNotification'])->name('midtrans.notification');
        Route::get('/midtrans/callback', [MidtransController::class, 'handleCallback'])->name('midtrans.callback');
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

        // Category management
        Route::resource('categories', AdminCategoryController::class);

        // Transaction management
        Route::get('/transactions/export', [AdminTransactionController::class, 'export'])->name('transactions.export');
        Route::resource('transactions', AdminTransactionController::class)->only(['index', 'show']);
        Route::post('/transactions/{transaction}/refund', [AdminTransactionController::class, 'refund'])->name('transactions.refund');

        // Reviews management
        Route::get('/reviews', [App\Http\Controllers\Admin\ReviewController::class, 'index'])->name('reviews.index');
        Route::get('/reviews/reported', [App\Http\Controllers\Admin\ReviewController::class, 'reported'])->name('reviews.reported');
        Route::get('/reviews/course/{course}', [App\Http\Controllers\Admin\ReviewController::class, 'course'])->name('reviews.course');
        Route::get('/reviews/{review}', [App\Http\Controllers\Admin\ReviewController::class, 'show'])->name('reviews.show');
        Route::get('/reviews/{review}/edit', [App\Http\Controllers\Admin\ReviewController::class, 'edit'])->name('reviews.edit');
        Route::put('/reviews/{review}', [App\Http\Controllers\Admin\ReviewController::class, 'update'])->name('reviews.update');
        Route::delete('/reviews/{review}', [App\Http\Controllers\Admin\ReviewController::class, 'destroy'])->name('reviews.destroy');
        Route::patch('/reviews/{review}/approve', [App\Http\Controllers\Admin\ReviewController::class, 'approve'])->name('reviews.approve');
        Route::patch('/reviews/{review}/approve-reported', [App\Http\Controllers\Admin\ReviewController::class, 'approveReported'])->name('reviews.approve-reported');
        Route::post('/reviews/{review}/respond', [App\Http\Controllers\Admin\ReviewController::class, 'respond'])->name('reviews.respond');

        // Reports
        Route::get('/reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
        Route::get('/reports/users', [ReportController::class, 'users'])->name('reports.users');
        Route::get('/reports/courses', [ReportController::class, 'courses'])->name('reports.courses');

        // Promo code management
        Route::resource('promo-codes', AdminPromoCodeController::class);
        Route::patch('/promo-codes/{promoCode}/toggle-active', [AdminPromoCodeController::class, 'toggleActive'])->name('promo-codes.toggle-active');
    });

    // Instructor routes
    Route::middleware(['role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
        Route::get('/dashboard', [InstructorDashboardController::class, 'index'])->name('dashboard');

        // Course management
        Route::resource('courses', InstructorCourseController::class);
        Route::patch('/courses/{course}/publish', [InstructorCourseController::class, 'togglePublish'])->name('courses.publish');

        // Reviews management
        Route::get('/reviews', [InstructorReviewController::class, 'index'])->name('reviews.index');
        Route::get('/reviews/course/{course}', [InstructorReviewController::class, 'course'])->name('reviews.course');
        Route::get('/reviews/{review}', [InstructorReviewController::class, 'show'])->name('reviews.show');
        Route::post('/reviews/{review}/respond', [InstructorReviewController::class, 'respond'])->name('reviews.respond');
        Route::post('/reviews/{review}/report', [InstructorReviewController::class, 'report'])->name('reviews.report');

        // Lesson routes - nested under courses
        Route::get('courses/{course}/lessons', [LessonController::class, 'index'])->name('courses.lessons.index');
        Route::get('courses/{course}/lessons/create', [LessonController::class, 'create'])->name('courses.lessons.create');
        Route::get('courses/{course}/lessons/{lesson}/edit', [LessonController::class, 'edit'])->name('courses.lessons.edit');
        Route::put('courses/{course}/lessons/{lesson}', [LessonController::class, 'update'])->name('courses.lessons.update');
        Route::delete('courses/{course}/lessons/{lesson}', [LessonController::class, 'destroy'])->name('courses.lessons.destroy');
        Route::post('courses/{course}/lessons', [LessonController::class, 'store'])->name('courses.lessons.store');
        Route::get('courses/{course}/lessons/{lesson}', [LessonController::class, 'show'])->name('courses.lessons.show');

        // Routes for standalone lessons
        // Route::get('lessons/{lesson}', [LessonController::class, 'show'])->name('courses.lessons.show');
        // Route::put('lessons/{lesson}', [LessonController::class, 'update'])->name('courses.lessons.update');
        // Route::delete('lessons/{lesson}', [LessonController::class, 'destroy'])->name('courses.lessons.destroy');
        // Route::post('courses/{course}/lessons/reorder', [LessonController::class, 'reorder'])->name('courses.lessons.reorder');

        // Video handling routes
        Route::post('lessons/videos/upload', [LessonController::class, 'uploadTemporaryVideo'])->name('lessons.videos.upload');
        Route::post('lessons/videos/delete', [LessonController::class, 'deleteTemporaryVideo'])->name('lessons.videos.delete');
        Route::get('lessons/{lesson}/video', [LessonController::class, 'streamVideo'])->name('lessons.videos.stream');

        // Student management
        Route::get('/students', [StudentController::class, 'index'])->name('students.index');
        Route::get('/students/course/{course}', [StudentController::class, 'course'])->name('students.course');
        Route::get('/students/{enrollment}', [StudentController::class, 'show'])->name('students.show');
        Route::delete('/students/{enrollment}', [StudentController::class, 'removeStudent'])->name('students.remove');

        // Lesson management
        // Route::resource('courses.lessons', LessonController::class);

        // Quiz management
        Route::resource('lessons.quizzes', InstructorQuizController::class);
        Route::resource('quizzes.questions', QuestionController::class);

        // Assignment management
        Route::resource('lessons.assignments', InstructorAssignmentController::class);
        Route::get('/assignments/submissions', [InstructorAssignmentController::class, 'allSubmissions'])->name('assignments.submissions.all');
        Route::get('/assignments/{assignment}/submissions', [InstructorAssignmentController::class, 'submissions'])->name('assignments.submissions');
        Route::patch('/assignments/submissions/{submission}/grade', [InstructorAssignmentController::class, 'gradeSubmission'])->name('assignments.submissions.grade');

        // Earnings routes
        Route::get('/earnings', [EarningController::class, 'index'])->name('earnings.index');
        Route::get('/earnings/withdraw', [EarningController::class, 'withdrawForm'])->name('earnings.withdraw');
        Route::post('/earnings/withdraw', [EarningController::class, 'requestWithdrawal'])->name('earnings.request-withdrawal');
        Route::get('/earnings/courses/{course}', [EarningController::class, 'courseEarnings'])->name('earnings.course');
    });

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
