<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Display a listing of students enrolled in the instructor's courses.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $instructor = Auth::user();

        // Get all courses by this instructor
        $courseIds = Course::where('user_id', $instructor->id)
            ->pluck('id');

        // Get all enrollments for these courses with student information
        $enrollments = Enrollment::whereIn('course_id', $courseIds)
            ->with(['user:id,name,email,profile_photo_path', 'course:id,title,slug'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Instructor/Students/Index', [
            'enrollments' => $enrollments
        ]);
    }

    /**
     * Display students enrolled in a specific course.
     *
     * @param  \App\Models\Course  $course
     * @return \Inertia\Response
     */
    public function course(Course $course)
    {
        // Ensure the instructor owns this course
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.students.index')
                ->with('error', 'You do not have permission to view students for this course');
        }

        $enrollments = $course->enrollments()
            ->with(['user:id,name,email,profile_photo_path'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Instructor/Students/Course', [
            'course' => $course,
            'enrollments' => $enrollments
        ]);
    }

    /**
     * Display details about a specific student's enrollment.
     *
     * @param  \App\Models\Enrollment  $enrollment
     * @return \Inertia\Response
     */
    public function show(Enrollment $enrollment)
    {
        $course = $enrollment->course;

        // Ensure the instructor owns this course
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.students.index')
                ->with('error', 'You do not have permission to view this student');
        }

        // Load the student with their enrollment details
        $enrollment->load([
            'user:id,name,email,profile_photo_path',
            'course:id,title,slug,user_id',
            'completedLessons:id,title'
        ]);

        // Get progress statistics
        $totalLessons = $course->lessons()->count();
        $completedLessons = $enrollment->completedLessons()->count();
        $progressPercentage = $totalLessons > 0 ? ($completedLessons / $totalLessons) * 100 : 0;

        return Inertia::render('Instructor/Students/Show', [
            'enrollment' => $enrollment,
            'progress' => [
                'completed' => $completedLessons,
                'total' => $totalLessons,
                'percentage' => round($progressPercentage, 1)
            ]
        ]);
    }

    /**
     * Remove a student from a course.
     *
     * @param  \App\Models\Enrollment  $enrollment
     * @return \Illuminate\Http\RedirectResponse
     */
    public function removeStudent(Enrollment $enrollment)
    {
        $course = $enrollment->course;

        // Ensure the instructor owns this course
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.students.index')
                ->with('error', 'You do not have permission to remove this student');
        }

        // Store course ID before deleting enrollment
        $courseId = $course->id;

        // Delete the enrollment
        $enrollment->delete();

        return redirect()->route('instructor.students.course', $courseId)
            ->with('success', 'Student removed from course successfully');
    }
}
