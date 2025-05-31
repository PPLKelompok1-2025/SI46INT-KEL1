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
use App\Http\Controllers\VideoController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\Admin\WithdrawalRequestController;
use App\Http\Controllers\Instructor\PaymentMethodController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

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

        // Withdrawal requests management
        Route::get('/withdrawal-requests', [WithdrawalRequestController::class, 'index'])->name('withdrawal-requests.index');
        Route::get('/withdrawal-requests/{withdrawalRequest}', [WithdrawalRequestController::class, 'show'])->name('withdrawal-requests.show');
        Route::patch('/withdrawal-requests/{withdrawalRequest}/approve', [WithdrawalRequestController::class, 'approve'])->name('withdrawal-requests.approve');
        Route::patch('/withdrawal-requests/{withdrawalRequest}/reject', [WithdrawalRequestController::class, 'reject'])->name('withdrawal-requests.reject');
    });

    // Instructor routes
    Route::middleware(['role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
        Route::get('/dashboard', [InstructorDashboardController::class, 'index'])->name('dashboard');

        // Course management
        Route::resource('courses', InstructorCourseController::class);
        Route::patch('/courses/{course}/publish', [InstructorCourseController::class, 'togglePublish'])->name('courses.publish');

        // Donations management
        Route::get('/courses/{course}/donations', [DonationController::class, 'courseIndex'])->name('courses.donations');

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
        Route::post('courses/{course}/lessons/reorder', [LessonController::class, 'reorder'])->name('courses.lessons.reorder');


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
        Route::post('lessons/{lesson}/quizzes/generate', [InstructorQuizController::class, 'generateQuiz'])->name('lessons.quizzes.generate');
        Route::resource('quizzes.questions', QuestionController::class);

        // Assignment management
        Route::resource('lessons.assignments', InstructorAssignmentController::class);
        Route::get('/assignments/{assignment}/download-materials', [InstructorAssignmentController::class, 'downloadAssignmentMaterials'])->name('assignments.download-materials');
        Route::get('/assignments/submissions', [InstructorAssignmentController::class, 'allSubmissions'])->name('assignments.submissions.all');
        Route::get('/assignments/{assignment}/submissions', [InstructorAssignmentController::class, 'submissions'])->name('assignments.submissions');
        Route::patch('/assignments/submissions/{submission}/grade', [InstructorAssignmentController::class, 'gradeSubmission'])->name('assignments.submissions.grade');
        Route::get('/assignments/submissions/{submission}/download', [InstructorAssignmentController::class, 'downloadSubmission'])->name('assignments.submissions.download');

        // Earnings routes
        Route::get('/earnings', [EarningController::class, 'index'])->name('earnings.index');
        Route::get('/earnings/withdraw', [EarningController::class, 'withdrawForm'])->name('earnings.withdraw');
        Route::post('/earnings/withdraw', [EarningController::class, 'requestWithdrawal'])->name('earnings.request-withdrawal');
        Route::get('/earnings/courses/{course}', [EarningController::class, 'courseEarnings'])->name('earnings.course');

        // Payment methods management
        Route::resource('payment-methods', PaymentMethodController::class);
        Route::patch('/payment-methods/{paymentMethod}/set-default', [PaymentMethodController::class, 'setDefault'])->name('payment-methods.set-default');
    });

    // Student routes
    Route::middleware(['role:student'])->prefix('student')->name('student.')->group(function () {
        Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('dashboard');

        // Course enrollment and learning
        Route::get('/courses', [StudentCourseController::class, 'index'])->name('courses.index');
        Route::get('/courses/{course:slug}', [StudentCourseController::class, 'show'])->name('courses.show');
        Route::post('/courses/{course}/enroll', [EnrollmentController::class, 'enroll'])->name('courses.enroll');
        Route::get('/courses/{course}/learn', [StudentCourseController::class, 'learn'])->name('courses.learn');
        Route::post('/courses/{course}/complete', [EnrollmentController::class, 'complete'])->name('courses.complete');
        Route::post('/lessons/{lesson}/complete', [EnrollmentController::class, 'completeLesson'])->name('lessons.complete');
        Route::post('/courses/{course}/review', [StudentCourseController::class, 'review'])->name('courses.review');
        Route::put('/courses/{course}/review/{review}', [StudentCourseController::class, 'updateReview'])->name('courses.review.update');
        Route::delete('/courses/{course}/review/{review}', [StudentCourseController::class, 'deleteReview'])->name('courses.review.delete');

        // Transaction routes
        Route::get('/transactions', [App\Http\Controllers\Student\TransactionController::class, 'index'])->name('transactions.index');
        Route::get('/transactions/{transaction}', [App\Http\Controllers\Student\TransactionController::class, 'show'])->name('transactions.show');
        Route::get('/donations/{donation}', [App\Http\Controllers\Student\TransactionController::class, 'showDonation'])->name('donations.show');

        // Video streaming route for students
        Route::get('/lessons/{lesson}/video', [StudentCourseController::class, 'streamVideo'])->name('lessons.videos.stream');

        // Quiz taking
        Route::get('/quizzes/{quiz}', [StudentQuizController::class, 'show'])->name('quizzes.show');
        Route::post('/quizzes/{quiz}/submit', [StudentQuizController::class, 'submit'])->name('quizzes.submit');
        Route::get('/quizzes/{quiz}/results', [StudentQuizController::class, 'results'])->name('quizzes.results');

        // Assignment submission
        Route::get('/assignments/{assignment}', [StudentAssignmentController::class, 'show'])->name('assignments.show');
        Route::post('/assignments/{assignment}/submit', [StudentAssignmentController::class, 'submit'])->name('assignments.submit');
        Route::get('/assignments/{assignment}/feedback', [StudentAssignmentController::class, 'feedback'])->name('assignments.feedback');
        Route::get('/assignments/{assignment}/download-materials', [StudentAssignmentController::class, 'downloadAssignmentMaterials'])->name('assignments.download-materials');
        Route::get('/assignments/submissions/{submission}/download', [StudentAssignmentController::class, 'downloadSubmission'])->name('assignments.submissions.download');

        // Certificates
        Route::get('/certificates', [CertificateController::class, 'index'])->name('certificates.index');
        Route::get('/certificates/{certificate}', [CertificateController::class, 'show'])->name('certificates.show');
        Route::get('/certificates/{certificate}/preview', [CertificateController::class, 'preview'])->name('certificates.preview');
        Route::get('/certificates/{certificate}/download', [CertificateController::class, 'download'])->name('certificates.download');

        // Wishlist routes
        Route::get('/wishlist', [StudentCourseController::class, 'wishlist'])->name('wishlist');
        Route::post('/courses/{course}/wishlist', [StudentCourseController::class, 'toggleWishlist'])->name('courses.wishlist.toggle');

        // Notes routes
        Route::get('/notes', [StudentNoteController::class, 'index'])->name('notes.index');
        Route::get('/courses/{course}/notes/create', [StudentNoteController::class, 'create'])->name('notes.create');
        Route::post('/courses/{course}/notes', [StudentNoteController::class, 'store'])->name('notes.store');
        Route::get('/notes/{note}/edit', [StudentNoteController::class, 'edit'])->name('notes.edit');
        Route::put('/notes/{note}', [StudentNoteController::class, 'update'])->name('notes.update');
        Route::delete('/notes/{note}', [StudentNoteController::class, 'destroy'])->name('notes.destroy');
    });
});

// Video serving routes
Route::get('/video/playlist/{playlist}', [VideoController::class, 'servePlaylist'])->name('video.playlist');
Route::get('/video/key/{key}', [VideoController::class, 'serveKey'])->name('video.key');

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
require __DIR__.'/discussion.php';
require __DIR__.'/certificate.php';
require __DIR__.'/wishlist.php';
