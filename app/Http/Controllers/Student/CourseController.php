<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Review;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Display a listing of the student's enrolled courses.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $user = Auth::user();

        $enrolledCourses = $user->enrollments()
            ->with(['course' => function ($query) {
                $query->with(['user', 'category', 'lessons']);
            }])
            ->get()
            ->map(function ($enrollment) {
                $course = $enrollment->course;
                $course->progress = [
                    'percentage' => $enrollment->progress_percentage,
                    'completed_lessons' => $enrollment->completed_lessons_count,
                    'total_lessons' => $course->lessons->count(),
                ];
                $course->enrollment_id = $enrollment->id;
                $course->enrollment_status = $enrollment->status;
                return $course;
            });

        return Inertia::render('Student/Courses/Index', [
            'courses' => $enrolledCourses
        ]);
    }

    /**
     * Display the specified course.
     *
     * @param  \App\Models\Course  $course
     * @return \Inertia\Response
     */
    public function show(Course $course)
    {
        $user = Auth::user();

        // Load course with relationships
        $course->load(['user', 'category', 'lessons', 'reviews' => function ($query) {
            $query->where('is_approved', true);
        }]);

        // Check if student is enrolled
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        $isEnrolled = !is_null($enrollment);

        // Get progress if enrolled
        $progress = null;
        if ($isEnrolled) {
            $progress = [
                'percentage' => $enrollment->progress_percentage,
                'completed_lessons' => $enrollment->completed_lessons_count,
                'total_lessons' => $course->lessons->count(),
                'last_accessed' => $enrollment->last_accessed_at,
            ];
        }

        // Check if student has reviewed this course
        $hasReviewed = Review::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->exists();

        return Inertia::render('Student/Courses/Show', [
            'course' => $course,
            'isEnrolled' => $isEnrolled,
            'progress' => $progress,
            'hasReviewed' => $hasReviewed,
        ]);
    }

    /**
     * Display the course learning interface.
     *
     * @param  \App\Models\Course  $course
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function learn(Course $course)
    {
        $user = Auth::user();

        // Check if student is enrolled
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return redirect()->route('student.courses.show', $course->slug)
                ->with('error', 'You must be enrolled in this course to access the learning materials.');
        }

        // Load course with relationships
        $course->load(['lessons' => function ($query) {
            $query->orderBy('order');
        }]);

        // Get completed lessons
        $completedLessons = $enrollment->completedLessons()->pluck('lesson_id')->toArray();

        // Update last accessed timestamp
        $enrollment->update([
            'last_accessed_at' => now()
        ]);

        // Find the next lesson to continue (first incomplete lesson or first lesson)
        $nextLesson = $course->lessons->first(function ($lesson) use ($completedLessons) {
            return !in_array($lesson->id, $completedLessons);
        }) ?? $course->lessons->first();

        return Inertia::render('Student/Courses/Learn', [
            'course' => $course,
            'completedLessons' => $completedLessons,
            'nextLesson' => $nextLesson,
            'progress' => [
                'percentage' => $enrollment->progress_percentage,
                'completed_lessons' => count($completedLessons),
                'total_lessons' => $course->lessons->count(),
            ]
        ]);
    }

    /**
     * Display a specific lesson within a course.
     *
     * @param  \App\Models\Course  $course
     * @param  \App\Models\Lesson  $lesson
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function lesson(Course $course, Lesson $lesson)
    {
        $user = Auth::user();

        // Check if student is enrolled
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return redirect()->route('student.courses.show', $course->slug)
                ->with('error', 'You must be enrolled in this course to access the lessons.');
        }

        // Check if lesson belongs to the course
        if ($lesson->course_id !== $course->id) {
            return redirect()->route('student.courses.learn', $course->slug)
                ->with('error', 'The requested lesson does not belong to this course.');
        }

        // Load course with all lessons for navigation
        $course->load(['lessons' => function ($query) {
            $query->orderBy('order');
        }]);

        // Load lesson with its content and attachments
        $lesson->load(['quizzes', 'assignments']);

        // Get completed lessons
        $completedLessons = $enrollment->completedLessons()->pluck('lesson_id')->toArray();

        // Check if this lesson is completed
        $isCompleted = in_array($lesson->id, $completedLessons);

        // Get previous and next lessons for navigation
        $lessonIds = $course->lessons->pluck('id')->toArray();
        $currentIndex = array_search($lesson->id, $lessonIds);
        $previousLesson = $currentIndex > 0 ? $course->lessons[$currentIndex - 1] : null;
        $nextLesson = $currentIndex < count($lessonIds) - 1 ? $course->lessons[$currentIndex + 1] : null;

        // Update last accessed timestamp
        $enrollment->update([
            'last_accessed_at' => now()
        ]);

        return Inertia::render('Student/Courses/Lesson', [
            'course' => $course,
            'lesson' => $lesson,
            'isCompleted' => $isCompleted,
            'completedLessons' => $completedLessons,
            'previousLesson' => $previousLesson,
            'nextLesson' => $nextLesson,
            'progress' => [
                'percentage' => $enrollment->progress_percentage,
                'completed_lessons' => count($completedLessons),
                'total_lessons' => $course->lessons->count(),
            ]
        ]);
    }

    /**
     * Display the student's wishlist.
     *
     * @return \Inertia\Response
     */
    public function wishlist()
    {
        $user = Auth::user();

        $wishlistedCourses = $user->wishlistedCourses()
            ->with(['user', 'category', 'lessons'])
            ->get()
            ->map(function ($course) use ($user) {
                // Check if the user is enrolled in this course
                $enrollment = Enrollment::where('user_id', $user->id)
                    ->where('course_id', $course->id)
                    ->first();

                $course->is_enrolled = !is_null($enrollment);

                return $course;
            });

        return Inertia::render('Student/Wishlist', [
            'courses' => $wishlistedCourses
        ]);
    }

    /**
     * Add a course to the student's wishlist.
     *
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\RedirectResponse
     */
    public function addToWishlist(Course $course)
    {
        $user = Auth::user();

        // Check if the course is already in the wishlist
        $existingWishlist = Wishlist::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$existingWishlist) {
            Wishlist::create([
                'user_id' => $user->id,
                'course_id' => $course->id
            ]);

            return redirect()->back()->with('success', 'Course added to wishlist');
        }

        return redirect()->back()->with('info', 'Course is already in your wishlist');
    }

    /**
     * Remove a course from the student's wishlist.
     *
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\RedirectResponse
     */
    public function removeFromWishlist(Course $course)
    {
        $user = Auth::user();

        Wishlist::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->delete();

        return redirect()->back()->with('success', 'Course removed from wishlist');
    }

    /**
     * Check if a course is in the student's wishlist.
     *
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\JsonResponse
     */
    public function isWishlisted(Course $course)
    {
        $user = Auth::user();

        $isWishlisted = Wishlist::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->exists();

        return response()->json([
            'isWishlisted' => $isWishlisted
        ]);
    }
}
