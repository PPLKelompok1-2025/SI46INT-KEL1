<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Review;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the instructor dashboard.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $instructor = Auth::user();

        // Get instructor's courses with counts
        $courses = Course::where('user_id', $instructor->id)
            ->withCount(['lessons', 'enrollments', 'reviews'])
            ->get();

        // Calculate total students (unique enrollments)
        $totalStudents = Enrollment::whereIn('course_id', $courses->pluck('id'))
            ->distinct('user_id')
            ->count('user_id');

        // Get average rating across all courses
        $averageRating = Review::whereIn('course_id', $courses->pluck('id'))
            ->where('is_approved', true)
            ->avg('rating') ?? 0;

        // Get recent enrollments
        $recentEnrollments = Enrollment::whereIn('course_id', $courses->pluck('id'))
            ->with(['user', 'course'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get recent reviews
        $recentReviews = Review::whereIn('course_id', $courses->pluck('id'))
            ->with(['user', 'course'])
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Calculate earnings
        $earnings = Transaction::whereIn('course_id', $courses->pluck('id'))
            ->select(
                DB::raw('SUM(amount) as total'),
                DB::raw('SUM(CASE WHEN created_at >= DATE_TRUNC(\'month\', CURRENT_DATE) THEN amount ELSE 0 END) as month_to_date')
            )
            ->first();

        // Get earnings by month for the chart (last 6 months)
        $monthlyEarnings = Transaction::whereIn('course_id', $courses->pluck('id'))
            ->select(
                DB::raw('DATE_TRUNC(\'month\', created_at) as month'),
                DB::raw('SUM(amount) as total')
            )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => date('M Y', strtotime($item->month)),
                    'total' => $item->total,
                ];
            });

        // Get recent courses (newly added)
        $recentCourses = Course::where('user_id', $instructor->id)
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get();

        // Get enrollments by course for the chart
        $enrollmentsByCourse = Enrollment::whereIn('course_id', $courses->pluck('id'))
            ->select('course_id', DB::raw('count(*) as total'))
            ->groupBy('course_id')
            ->get()
            ->map(function ($item) use ($courses) {
                $course = $courses->firstWhere('id', $item->course_id);
                return [
                    'course' => $course ? $course->title : 'Unknown Course',
                    'total' => $item->total,
                ];
            });

        // Get popular courses
        $popularCourses = $courses->sortByDesc('enrollments_count')->take(5)->values();

        // Get courses that need attention (no lessons, low rating, etc.)
        $coursesNeedingAttention = $courses->filter(function ($course) {
            return $course->lessons_count === 0 ||
                   ($course->reviews_count > 0 && $course->reviews->avg('rating') < 3) ||
                   !$course->is_published;
        })->values();

        // Get pending assignments that need grading
        $pendingAssignments = DB::table('assignment_submissions')
            ->join('assignments', 'assignment_submissions.assignment_id', '=', 'assignments.id')
            ->join('lessons', 'assignments.lesson_id', '=', 'lessons.id')
            ->join('courses', 'lessons.course_id', '=', 'courses.id')
            ->join('users', 'assignment_submissions.user_id', '=', 'users.id')
            ->select(
                'assignment_submissions.id as submission_id',
                'assignments.title as assignment_title',
                'courses.title as course_title',
                'users.name as student_name',
                'assignment_submissions.submitted_at'
            )
            ->whereNull('assignment_submissions.score')
            ->whereNull('assignment_submissions.graded_at')
            ->where('courses.user_id', $instructor->id)
            ->orderBy('assignment_submissions.submitted_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Instructor/Dashboard', [
            'stats' => [
                'totalCourses' => $courses->count(),
                'totalStudents' => $totalStudents,
                'totalLessons' => $courses->sum('lessons_count'),
                'averageRating' => round($averageRating, 1),
                'totalEarnings' => $earnings->total ?? 0,
                'monthToDateEarnings' => $earnings->month_to_date ?? 0,
            ],
            'recentEnrollments' => $recentEnrollments,
            'recentReviews' => $recentReviews,
            'recentCourses' => $recentCourses, // Added this line
            'popularCourses' => $popularCourses,
            'coursesNeedingAttention' => $coursesNeedingAttention,
            'pendingAssignments' => $pendingAssignments,
            'charts' => [
                'monthlyEarnings' => $monthlyEarnings,
                'enrollmentsByCourse' => $enrollmentsByCourse,
            ],
        ]);
    }
}
