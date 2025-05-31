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
use App\Models\Note;

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

                // Get actual completed lessons count
                $completedLessonsCount = $enrollment->completedLessons()->count();
                $totalLessonsCount = $course->lessons_count ?: 0;

                // Calculate progress percentage
                $progressPercentage = $totalLessonsCount > 0
                    ? round(($completedLessonsCount / $totalLessonsCount) * 100)
                    : 0;

                // Update enrollment progress if needed
                if ($enrollment->progress != $progressPercentage) {
                    $enrollment->updateProgress($progressPercentage);
                }

                $course->progress = [
                    'percentage' => $progressPercentage,
                    'completed_lessons' => $completedLessonsCount,
                    'total_lessons' => $totalLessonsCount,
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
                ? round(($completedLessonsCount / $totalLessonsCount) * 100)
                : 0;

            if ($enrollment->progress != $progressPercentage) {
                $enrollment->updateProgress($progressPercentage);
            }

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
            ->where('is_approved', true)
            ->with('user:id,name,profile_photo_path')
            ->select('id', 'course_id', 'user_id', 'rating', 'comment', 'created_at')
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
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function learn(Request $request, Course $course)
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
            $query->orderBy('order')
                  ->with([
                      'assignments',
                      'quizzes' => function ($q) {
                          $q->select('id', 'lesson_id', 'title');
                      },
                  ]);
        }]);

        $totalDuration = $course->lessons->sum('duration');
        $course->duration = $totalDuration > 0 ? round($totalDuration / 60, 1) : 0;

        $completedLessons = $enrollment->completedLessons()->pluck('lesson_id')->toArray();
        $completedLessonsCount = count($completedLessons);
        $totalLessonsCount = $course->lessons->count();

        $progressPercentage = $totalLessonsCount > 0
            ? round(($completedLessonsCount / $totalLessonsCount) * 100)
            : 0;

        if ($enrollment->progress != $progressPercentage) {
            $enrollment->updateProgress($progressPercentage);
        }

        $enrollment->touch();

        $nextLesson = $course->lessons->first(function ($lesson) use ($completedLessons) {
            return !in_array($lesson->id, $completedLessons);
        }) ?? $course->lessons->first();

        // Get active lesson from URL parameter if it exists
        $activeLessonId = $request->query('lesson');
        $activeLesson = null;

        if ($activeLessonId) {
            $activeLesson = $course->lessons->firstWhere('id', $activeLessonId);
        }

        // If no active lesson was found from URL or it's invalid, use the next lesson
        if (!$activeLesson) {
            $activeLesson = $nextLesson;
        }

        // Load existing note if any
        $note = Note::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        return Inertia::render('Student/Courses/Learn', [
            'course' => $course,
            'completedLessons' => $completedLessons,
            'nextLesson' => $nextLesson,
            'activeLesson' => $activeLesson,
            'progress' => [
                'percentage' => $progressPercentage,
                'completed_lessons' => $completedLessonsCount,
                'total_lessons' => $totalLessonsCount,
                'last_accessed' => $enrollment->updated_at,
            ],
            'note' => $note,
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
