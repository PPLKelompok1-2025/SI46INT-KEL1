<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the student dashboard.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $user = Auth::user();

        // Get all enrolled courses with progress information
        $enrolledCourses = $user->enrollments()
            ->with(['course' => function ($query) {
                $query->with(['user', 'category']);
            }])
            ->get()
            ->map(function ($enrollment) {
                $course = $enrollment->course;
                $course->progress = [
                    'percentage' => $enrollment->progress_percentage,
                    'completed_lessons' => $enrollment->completed_lessons_count,
                    'total_lessons' => $course->lessons_count,
                    'last_accessed' => $enrollment->last_accessed_at,
                ];
                $course->enrollment_id = $enrollment->id;
                $course->enrollment_status = $enrollment->status;
                $course->enrolled_at = $enrollment->created_at;
                return $course;
            });

        // Filter for in-progress courses
        $inProgressCourses = $enrolledCourses->filter(function ($course) {
            return $course->progress['percentage'] < 100 && $course->enrollment_status !== 'completed';
        })->values();

        // Filter for completed courses
        $completedCourses = $enrolledCourses->filter(function ($course) {
            return $course->progress['percentage'] === 100 || $course->enrollment_status === 'completed';
        })->values();

        // Get certificates
        $certificates = Certificate::where('user_id', $user->id)
            ->with('course')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get recent activities (optional, commented out in the frontend)
        // $recentActivities = Activity::where('user_id', $user->id)
        //     ->orderBy('created_at', 'desc')
        //     ->limit(5)
        //     ->get();

        return Inertia::render('Student/Dashboard', [
            'enrolledCourses' => $enrolledCourses,
            'inProgressCourses' => $inProgressCourses,
            'completedCourses' => $completedCourses,
            'certificates' => $certificates,
            // 'recentActivities' => $recentActivities,
        ]);
    }
}
