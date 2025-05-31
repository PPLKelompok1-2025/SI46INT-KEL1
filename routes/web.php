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
