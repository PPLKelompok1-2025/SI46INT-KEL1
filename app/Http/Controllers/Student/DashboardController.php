<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the student dashboard.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $page = $request->input('page', 1);
        $perPage = 6;
        $activeTab = $request->query('tab', 'in-progress');

        $enrolledCoursesQuery = $user->enrollments()
            ->with(['course' => function ($query) {
                $query->with(['user', 'category'])
                      ->withCount(['lessons', 'reviews'])
                      ->withAvg('reviews', 'rating');
            }])
            ->with('completedLessons')
            ->withCount('completedLessons');

        $totalEnrolledCount = $enrolledCoursesQuery->count();

        $paginatedEnrollments = $enrolledCoursesQuery->paginate($perPage, ['*'], 'page', $page);

        $enrolledCourses = $paginatedEnrollments->map(function ($enrollment) use ($user) {
            $course = $enrollment->course;
            $course->progress = [
                'percentage' => $enrollment->progress,
                'completed_lessons' => $enrollment->completed_lessons_count,
                'total_lessons' => $course->lessons_count,
                'last_accessed' => $enrollment->updated_at,
            ];
            $course->enrollment_id = $enrollment->id;
            $course->enrollment_status = $enrollment->completed_at ? 'completed' : 'in-progress';
            $course->enrolled_at = $enrollment->created_at;
            $course->average_rating = $course->getAverageRatingAttribute() ?? 0;
            
            $review = Review::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();
                
            $course->has_reviewed = !is_null($review);
            $course->review = $review;
            $course->is_approved = $review ? $review->is_approved : false;
            
            return $course;
        });

        $inProgressCoursesQuery = $user->enrollments()
            ->where('progress', '<', 100)
            ->whereNull('completed_at')
            ->with(['course' => function ($query) {
                $query->with(['user', 'category'])
                      ->withCount(['lessons', 'reviews'])
                      ->withAvg('reviews', 'rating');
            }])
            ->with('completedLessons')
            ->withCount('completedLessons');

        $totalInProgressCount = $inProgressCoursesQuery->count();

        $paginatedInProgress = $inProgressCoursesQuery->paginate($perPage, ['*'], 'in_progress_page', $request->input('in_progress_page', 1));

        $inProgressCourses = $paginatedInProgress->map(function ($enrollment) use ($user) {
            $course = $enrollment->course;
            $course->progress = [
                'percentage' => $enrollment->progress,
                'completed_lessons' => $enrollment->completed_lessons_count,
                'total_lessons' => $course->lessons_count,
                'last_accessed' => $enrollment->updated_at,
            ];
            $course->enrollment_id = $enrollment->id;
            $course->enrollment_status = 'in-progress';
            $course->enrolled_at = $enrollment->created_at;
            $course->average_rating = $course->getAverageRatingAttribute() ?? 0;
            
            $review = Review::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();
                
            $course->has_reviewed = !is_null($review);
            $course->review = $review;
            $course->is_approved = $review ? $review->is_approved : false;
            
            return $course;
        });

        $completedCoursesQuery = $user->enrollments()
            ->where(function($query) {
                $query->where('progress', '=', 100)
                      ->orWhereNotNull('completed_at');
            })
            ->with(['course' => function ($query) {
                $query->with(['user', 'category'])
                      ->withCount(['lessons', 'reviews'])
                      ->withAvg('reviews', 'rating');
            }])
            ->with('completedLessons')
            ->withCount('completedLessons');

        $totalCompletedCount = $completedCoursesQuery->count();

        $paginatedCompleted = $completedCoursesQuery->paginate($perPage, ['*'], 'completed_page', $request->input('completed_page', 1));

        $completedCourses = $paginatedCompleted->map(function ($enrollment) use ($user) {
            $course = $enrollment->course;
            $course->progress = [
                'percentage' => $enrollment->progress,
                'completed_lessons' => $enrollment->completed_lessons_count,
                'total_lessons' => $course->lessons_count,
                'last_accessed' => $enrollment->updated_at,
            ];
            $course->enrollment_id = $enrollment->id;
            $course->enrollment_status = 'completed';
            $course->enrolled_at = $enrollment->created_at;
            $course->average_rating = $course->getAverageRatingAttribute() ?? 0;
            
            $review = Review::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();
                
            $course->has_reviewed = !is_null($review);
            $course->review = $review;
            $course->is_approved = $review ? $review->is_approved : false;
            
            return $course;
        });

        $certificatesQuery = Certificate::where('user_id', $user->id)
            ->with(['course' => function ($query) {
                $query->with(['user', 'category'])
                      ->withCount('reviews')
                      ->withAvg('reviews', 'rating');
            }])
            ->orderBy('created_at', 'desc');

        $totalCertificatesCount = $certificatesQuery->count();

        $paginatedCertificates = $certificatesQuery->paginate($perPage, ['*'], 'certificates_page', $request->input('certificates_page', 1));

        $enrolledPagination = $paginatedEnrollments->toArray();
        $inProgressPagination = $paginatedInProgress->toArray();
        $completedPagination = $paginatedCompleted->toArray();
        $certificatesPagination = $paginatedCertificates->toArray();

        $isEnrolledNextPageExists = $enrolledPagination['current_page'] < $enrolledPagination['last_page'];
        $isInProgressNextPageExists = $inProgressPagination['current_page'] < $inProgressPagination['last_page'];
        $isCompletedNextPageExists = $completedPagination['current_page'] < $completedPagination['last_page'];
        $isCertificatesNextPageExists = $certificatesPagination['current_page'] < $certificatesPagination['last_page'];

        return Inertia::render('Student/Dashboard', [
            'enrolledCourses' => $enrolledCourses,
            'inProgressCourses' => $inProgressCourses,
            'completedCourses' => $completedCourses,
            'certificates' => Inertia::merge($paginatedCertificates->items()),
            'activeTab' => $activeTab,
            'page' => $page,
            'inProgressPage' => $request->input('in_progress_page', 1),
            'completedPage' => $request->input('completed_page', 1),
            'certificatesPage' => $request->input('certificates_page', 1),
            'isEnrolledNextPageExists' => $isEnrolledNextPageExists,
            'isInProgressNextPageExists' => $isInProgressNextPageExists,
            'isCompletedNextPageExists' => $isCompletedNextPageExists,
            'isCertificatesNextPageExists' => $isCertificatesNextPageExists,
            'totalCounts' => [
                'enrolled' => $totalEnrolledCount,
                'inProgress' => $totalInProgressCount,
                'completed' => $totalCompletedCount,
                'certificates' => $totalCertificatesCount,
            ],
        ]);
    }
}
