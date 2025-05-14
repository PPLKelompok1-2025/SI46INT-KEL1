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
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;

class CourseController extends Controller
{
    /**
     * Display a listing of the student's enrolled courses.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $page = $request->input('page', 1);
        $perPage = 9;

        $enrollmentsQuery = $user->enrollments()
            ->with(['course' => function ($query) {
                $query->with(['user', 'category'])
                      ->withCount('lessons')
                      ->withAvg('reviews', 'rating');
            }]);

        $paginatedEnrollments = $enrollmentsQuery->paginate($perPage);

        $enrolledCourses = $paginatedEnrollments->getCollection()
            ->map(function ($enrollment) {
                $course = $enrollment->course;

                $course->progress = [
                    'percentage' => $enrollment->progress,
                    'completed_lessons' => $enrollment->completedLessons()->count(),
                    'total_lessons' => $course->lessons_count,
                    'last_accessed' => $enrollment->updated_at,
                ];

                $course->enrollment_id = $enrollment->id;
                $course->enrollment_status = $enrollment->completed_at ? 'completed' : 'in-progress';
                $course->enrolled_at = $enrollment->created_at;
                $course->average_rating = $course->getAverageRatingAttribute() ?? 0;

                return $course;
            });

        $pagination = $paginatedEnrollments->toArray();
        $isNextPageExists = $pagination['current_page'] < $pagination['last_page'];

        return Inertia::render('Student/Courses/Index', [
            'courses' => $enrolledCourses,
            'page' => $page,
            'isNextPageExists' => $isNextPageExists
        ]);
    }

    /**
     * Display the specified course.
     *
     * @param  \App\Models\Course  $course
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function show(Request $request, Course $course)
    {
        $user = Auth::user();

        $course->load([
            'user:id,name',
            'category:id,name',
            'lessons' => function ($query) {
                $query->orderBy('order')->select('id', 'course_id', 'title', 'duration', 'is_free', 'order');
            },
        ]);

        $totalDuration = $course->lessons->sum('duration');
        $course->duration = $totalDuration > 0 ? round($totalDuration / 60, 1) : 0;

        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        $isEnrolled = !is_null($enrollment);

        $progress = null;
        if ($isEnrolled) {
            $completedLessonIds = $enrollment->completedLessons()->pluck('lesson_id')->toArray();
            $completedLessonsCount = count($completedLessonIds);
            $totalLessonsCount = $course->lessons->count();

            $progressPercentage = $totalLessonsCount > 0
                ? round(($completedLessonsCount / $totalLessonsCount) * 100, 2)
                : 0;

            $progress = [
                'percentage' => $progressPercentage,
                'completed_lessons' => $completedLessonsCount,
                'total_lessons' => $totalLessonsCount,
                'last_accessed' => $enrollment->updated_at,
                'completedLessons' => $completedLessonIds,
            ];
        }

        $course->append('average_rating');

        $hasReviewed = Review::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->exists();

        $hasPendingReview = Review::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->where('is_approved', false)
            ->exists();

        $signedInUserReview = Review::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (isset($course->requirements) && !is_array($course->requirements)) {
            $course->requirements = json_decode($course->requirements) ?? [];
        }

        if (isset($course->what_you_will_learn) && !is_array($course->what_you_will_learn)) {
            $course->what_you_will_learn = json_decode($course->what_you_will_learn) ?? [];
        }

        $course->signed_in_user_review = $signedInUserReview;

        $page = $request->input('page', 1);
        $perPage = 5;

        $reviewsQuery = $course->reviews()
            ->where(function ($query) use ($user) {
                $query->where('is_approved', true)
                      ->orWhere(function ($q) use ($user) {
                          $q->where('user_id', $user->id)
                            ->where('is_approved', false);
                      });
            })
            ->with('user:id,name,profile_photo_path')
            ->select('id', 'course_id', 'user_id', 'rating', 'comment', 'created_at', 'is_approved')
            ->orderByDesc('created_at');

        $reviews = $reviewsQuery->paginate($perPage);
        $reviewsPagination = $reviews->toArray();
        $isNextPageExists = $reviewsPagination['current_page'] < $reviewsPagination['last_page'];

        return Inertia::render('Student/Courses/Show', [
            'course' => $course,
            'isEnrolled' => $isEnrolled,
            'progress' => $progress,
            'hasReviewed' => $hasReviewed,
            'hasPendingReview' => $hasPendingReview,
            'activeTab' => $request->query('tab', 'overview'),
            'reviews' => Inertia::merge($reviews->items()),
            'page' => $page,
            'isNextPageExists' => $isNextPageExists
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

        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return redirect()->route('student.courses.show', $course->slug)
                ->with('error', 'You must be enrolled in this course to access the learning materials.');
        }

        $course->load(['lessons' => function ($query) {
            $query->orderBy('order');
        }]);

        $totalDuration = $course->lessons->sum('duration');
        $course->duration = $totalDuration > 0 ? round($totalDuration / 60, 1) : 0;

        $completedLessons = $enrollment->completedLessons()->pluck('lesson_id')->toArray();
        $completedLessonsCount = count($completedLessons);
        $totalLessonsCount = $course->lessons->count();

        $progressPercentage = $totalLessonsCount > 0
            ? round(($completedLessonsCount / $totalLessonsCount) * 100, 2)
            : 0;

        // $enrollment->update([
        //     'last_accessed_at' => now()
        // ]);

        $nextLesson = $course->lessons->first(function ($lesson) use ($completedLessons) {
            return !in_array($lesson->id, $completedLessons);
        }) ?? $course->lessons->first();

        return Inertia::render('Student/Courses/Learn', [
            'course' => $course,
            'completedLessons' => $completedLessons,
            'nextLesson' => $nextLesson,
            'progress' => [
                'percentage' => $progressPercentage,
                'completed_lessons' => $completedLessonsCount,
                'total_lessons' => $totalLessonsCount,
                'last_accessed' => $enrollment->updated_at,
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

        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return redirect()->route('student.courses.show', $course->slug)
                ->with('error', 'You must be enrolled in this course to access the lessons.');
        }

        if ($lesson->course_id !== $course->id) {
            return redirect()->route('student.courses.learn', $course->slug)
                ->with('error', 'The requested lesson does not belong to this course.');
        }

        $course->load(['lessons' => function ($query) {
            $query->orderBy('order');
        }]);
        $lesson->load(['quizzes', 'assignments']);

        $completedLessons = $enrollment->completedLessons()->pluck('lesson_id')->toArray();

        $isCompleted = in_array($lesson->id, $completedLessons);

        $lessonIds = $course->lessons->pluck('id')->toArray();
        $currentIndex = array_search($lesson->id, $lessonIds);
        $previousLesson = $currentIndex > 0 ? $course->lessons[$currentIndex - 1] : null;
        $nextLesson = $currentIndex < count($lessonIds) - 1 ? $course->lessons[$currentIndex + 1] : null;

        // $enrollment->update([
        //     'last_accessed_at' => now()
        // ]);

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
     * Display the student's wishlisted courses.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function wishlist(Request $request)
    {
        $user = Auth::user();
        $page = $request->input('page', 1);
        $perPage = 9;

        $wishlistQuery = $user->wishlistedCourses()
            ->with(['user', 'category', 'lessons']);

        $paginatedWishlist = $wishlistQuery->paginate($perPage);

        $pagination = $paginatedWishlist->toArray();
        $isNextPageExists = $pagination['current_page'] < $pagination['last_page'];

        return Inertia::render('Student/Wishlist', [
            'courses' => Inertia::merge($paginatedWishlist->items()),
            'page' => $page,
            'isNextPageExists' => $isNextPageExists
        ]);
    }

    /**
     * Toggle student's wishlist.
     *
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\RedirectResponse
     */
    public function toggleWishlist(Course $course)
    {
        $user = Auth::user();

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

        $existingWishlist->delete();

        return redirect()->back()->with('success', 'Course removed from wishlist');
    }

    /**
     * Stream encrypted video for students.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Lesson  $lesson
     * @return \Symfony\Component\HttpFoundation\StreamedResponse|\Illuminate\Http\Response
     */
    public function streamVideo(Request $request, Lesson $lesson)
    {
        $course = $lesson->course;
        $user = Auth::user();

        // Check if user is enrolled in the course or if the lesson is free
        $isEnrolled = $course->enrollments()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->exists();

        if (!$isEnrolled && !$lesson->is_free) {
            return Response::json(['error' => 'Unauthorized access. You must be enrolled in this course to access this video.'], 403);
        }

        if (!$lesson->hasEncryptedVideo()) {
            return Response::json(['error' => 'No video available'], 404);
        }

        // For .m3u8 playlist file
        if ($request->has('playlist')) {
            $path = Storage::disk($lesson->video_disk)->path($lesson->video_path);
            return Response::file($path);
        }

        // For .ts segment files
        if ($request->has('segment')) {
            $segmentPath = dirname($lesson->video_path) . '/' . $request->segment;
            $path = Storage::disk($lesson->video_disk)->path($segmentPath);
            return Response::file($path);
        }

        // For .key file
        if ($request->has('key')) {
            // Ensure this is authenticated and authorized - we already checked above
            if (!$lesson->encryption_key) {
                return Response::json(['error' => 'No encryption key available'], 404);
            }

            return Response::make($lesson->encryption_key)
                ->header('Content-Type', 'application/octet-stream');
        }

        return Response::json(['error' => 'Invalid request'], 400);
    }

    public function review(Course $course, Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:255',
        ]);

        $hasReviewed = Review::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->exists();

        if ($hasReviewed) {
            return redirect()->back()->with('error', 'You have already reviewed this course.');
        }

        $review = Review::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_approved' => false,
        ]);

        return redirect()->back()->with('success', 'Review submitted successfully');
    }

    public function updateReview(Course $course, Review $review, Request $request)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:255',
        ]);

        $review->update([
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_approved' => false,
        ]);

        return redirect()->back()->with('success', 'Review updated successfully');
    }

    public function deleteReview(Course $course, Review $review)
    {
        $review->delete();
        return redirect()->back()->with('success', 'Review deleted successfully');
    }
}