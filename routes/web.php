<?php

use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\Instructor\AssignmentController as InstructorAssignmentController;
use App\Http\Controllers\Instructor\CourseController as InstructorCourseController;
use App\Http\Controllers\Instructor\DashboardController as InstructorDashboardController;
use App\Http\Controllers\Instructor\EarningController;
use App\Http\Controllers\Instructor\LessonController;
use App\Http\Controllers\Instructor\QuizController as InstructorQuizController;
use App\Http\Controllers\Instructor\QuestionController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Student\AssignmentController as StudentAssignmentController;
use App\Http\Controllers\Student\CertificateController;
use App\Http\Controllers\Student\CourseController as StudentCourseController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\EnrollmentController;
use App\Http\Controllers\Student\NoteController as StudentNoteController;
use App\Http\Controllers\Student\QuizController as StudentQuizController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

// Public routes
Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
Route::get('/courses/{course:slug}', [CourseController::class, 'show'])->name('courses.show');
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/categories/{category:slug}', [CategoryController::class, 'show'])->name('categories.show');
Route::get('/search', [SearchController::class, 'index'])->name('search');

// Authentication routes (already provided by Breeze)
Route::middleware(['auth', 'verified'])->group(function () {
    // Common authenticated routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('profile/photo', [ProfileController::class, 'updatePhoto'])->name('profile.photo');

    // Payment routes
    Route::post('/payment/process', [PaymentController::class, 'process'])->name('payment.process');
    Route::get('/payment/success', [PaymentController::class, 'success'])->name('payment.success');
    Route::get('/payment/cancel', [PaymentController::class, 'cancel'])->name('payment.cancel');

    // Admin routes
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        // User management
        Route::resource('users', UserController::class);

        // Course management
        Route::resource('courses', AdminCourseController::class);
        Route::patch('/courses/{course}/approve', [AdminCourseController::class, 'approve'])->name('courses.approve');
        Route::patch('/courses/{course}/feature', [AdminCourseController::class, 'feature'])->name('courses.feature');

        // Category management
        Route::resource('categories', AdminCategoryController::class);

        // Transaction management
        Route::resource('transactions', AdminTransactionController::class)->only(['index', 'show']);
        Route::post('/transactions/{transaction}/refund', [AdminTransactionController::class, 'refund'])->name('transactions.refund');

        // Reports
        Route::get('/reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
        Route::get('/reports/users', [ReportController::class, 'users'])->name('reports.users');
        Route::get('/reports/courses', [ReportController::class, 'courses'])->name('reports.courses');
    });

    // Instructor routes
    Route::middleware(['role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
        Route::get('/dashboard', [InstructorDashboardController::class, 'index'])->name('dashboard');

        // Course management
        Route::resource('courses', InstructorCourseController::class);
        Route::patch('/courses/{course}/publish', [InstructorCourseController::class, 'publish'])->name('courses.publish');

        // Lesson management
        Route::resource('courses.lessons', LessonController::class);

        // Quiz management
        Route::resource('lessons.quizzes', InstructorQuizController::class);
        Route::resource('quizzes.questions', QuestionController::class);

        // Assignment management
        Route::resource('lessons.assignments', InstructorAssignmentController::class);
        Route::get('/assignments/submissions', [InstructorAssignmentController::class, 'allSubmissions'])->name('assignments.submissions.all');
        Route::get('/assignments/{assignment}/submissions', [InstructorAssignmentController::class, 'submissions'])->name('assignments.submissions');
        Route::patch('/assignments/submissions/{submission}/grade', [InstructorAssignmentController::class, 'gradeSubmission'])->name('assignments.submissions.grade');

        // Earnings
        Route::get('/earnings', [EarningController::class, 'index'])->name('earnings');
        Route::get('/earnings/withdraw', [EarningController::class, 'withdraw'])->name('earnings.withdraw');
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

        // Quiz taking
        Route::get('/quizzes/{quiz}', [StudentQuizController::class, 'show'])->name('quizzes.show');
        Route::post('/quizzes/{quiz}/submit', [StudentQuizController::class, 'submit'])->name('quizzes.submit');
        Route::get('/quizzes/{quiz}/results', [StudentQuizController::class, 'results'])->name('quizzes.results');

        // Assignment submission
        Route::get('/assignments/{assignment}', [StudentAssignmentController::class, 'show'])->name('assignments.show');
        Route::post('/assignments/{assignment}/submit', [StudentAssignmentController::class, 'submit'])->name('assignments.submit');
        Route::get('/assignments/{assignment}/feedback', [StudentAssignmentController::class, 'feedback'])->name('assignments.feedback');

        // Certificates
        Route::get('/certificates', [CertificateController::class, 'index'])->name('certificates.index');
        Route::get('/certificates/{certificate}', [CertificateController::class, 'show'])->name('certificates.show');
        Route::get('/certificates/{certificate}/download', [CertificateController::class, 'download'])->name('certificates.download');

        // Wishlist routes
        Route::get('/wishlist', [StudentCourseController::class, 'wishlist'])->name('wishlist');
        Route::post('/courses/{course}/wishlist', [StudentCourseController::class, 'addToWishlist'])->name('courses.wishlist.add');
        Route::delete('/courses/{course}/wishlist', [StudentCourseController::class, 'removeFromWishlist'])->name('courses.wishlist.remove');
        Route::get('/courses/{course}/wishlist/check', [StudentCourseController::class, 'isWishlisted'])->name('courses.wishlist.check');

        // Notes routes
        Route::get('/notes', [StudentNoteController::class, 'index'])->name('notes.index');
        Route::get('/courses/{course}/notes/create', [StudentNoteController::class, 'create'])->name('notes.create');
        Route::post('/courses/{course}/notes', [StudentNoteController::class, 'store'])->name('notes.store');
        Route::get('/notes/{note}/edit', [StudentNoteController::class, 'edit'])->name('notes.edit');
        Route::put('/notes/{note}', [StudentNoteController::class, 'update'])->name('notes.update');
        Route::delete('/notes/{note}', [StudentNoteController::class, 'destroy'])->name('notes.destroy');
    });
});

require __DIR__.'/auth.php';
