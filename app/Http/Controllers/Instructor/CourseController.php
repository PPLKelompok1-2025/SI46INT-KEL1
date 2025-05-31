<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Display a listing of the instructor's courses.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $instructor = Auth::user();

        $query = Course::where('user_id', $instructor->id)
            ->withCount(['lessons', 'enrollments', 'reviews'])
            ->with(['category', 'user']);

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('category') && $request->get('category') !== 'all') {
            $query->where('category_id', $request->get('category'));
        }

        if ($request->has('status') && $request->get('status') !== 'all') {
            $status = $request->get('status');
            if ($status === 'published') {
                $query->where('is_published', true);
            } elseif ($status === 'unpublished') {
                $query->where('is_published', false);
            } elseif ($status === 'approved') {
                $query->where('is_approved', true);
            } elseif ($status === 'unapproved') {
                $query->where('is_approved', false);
            } elseif ($status === 'featured') {
                $query->where('is_featured', true);
            }
        }

        if ($request->has('sort') && $request->sort) {
            $sortField = 'created_at';
            $sortDirection = 'desc';

            if ($request->sort === 'created_at_asc') {
                $sortField = 'created_at';
                $sortDirection = 'asc';
            } elseif ($request->sort === 'created_at_desc') {
                $sortField = 'created_at';
                $sortDirection = 'desc';
            } elseif ($request->sort === 'title_asc') {
                $sortField = 'title';
                $sortDirection = 'asc';
            } elseif ($request->sort === 'title_desc') {
                $sortField = 'title';
                $sortDirection = 'desc';
            } elseif ($request->sort === 'price_desc') {
                $sortField = 'price';
                $sortDirection = 'desc';
            } elseif ($request->sort === 'price_asc') {
                $sortField = 'price';
                $sortDirection = 'asc';
            } elseif ($request->sort === 'enrollments_desc') {
                $sortField = 'enrollments_count';
                $sortDirection = 'desc';
            } elseif ($request->sort === 'enrollments_asc') {
                $sortField = 'enrollments_count';
                $sortDirection = 'asc';
            } elseif ($request->sort === 'rating_desc') {
                $query->withAvg('reviews', 'rating')
                      ->orderBy('reviews_avg_rating', 'desc');
                $sortField = null;
            } elseif ($request->sort === 'rating_asc') {
                $query->withAvg('reviews', 'rating')
                      ->orderBy('reviews_avg_rating', 'asc');
                $sortField = null;
            }

            if ($sortField) {
                $query->orderBy($sortField, $sortDirection);
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $courses = $query->paginate(10)->withQueryString();

        foreach ($courses as $course) {
            $course->average_rating = $course->getAverageRatingAttribute();
        }

        $categories = Category::select('id', 'name')->orderBy('name')->get();

        $totalCourses = Course::where('user_id', $instructor->id)->count();
        $publishedCourses = Course::where('user_id', $instructor->id)
            ->where('is_published', true)
            ->count();
        $totalStudents = Enrollment::whereIn('course_id',
            Course::where('user_id', $instructor->id)->pluck('id')
        )->count();
        $totalLessons = Course::where('user_id', $instructor->id)
            ->withCount('lessons')
            ->get()
            ->sum('lessons_count');
        $averageRating = Course::where('user_id', $instructor->id)
            ->withCount('reviews')
            ->get()
            ->filter(function ($course) {
                return $course->reviews_count > 0;
            })
            ->avg(function ($course) {
                return $course->getAverageRatingAttribute();
            }) ?? 0;

        return Inertia::render('Instructor/Courses/Index', [
            'courses' => $courses,
            'categories' => $categories,
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', 'all'),
                'status' => $request->input('status', 'all'),
                'sort' => $request->input('sort', 'created_at_desc'),
            ],
            'stats' => [
                'totalCourses' => $totalCourses,
                'publishedCourses' => $publishedCourses,
                'totalStudents' => $totalStudents,
                'totalLessons' => $totalLessons,
                'averageRating' => round($averageRating, 1),
            ]
        ]);
    }

    /**
     * Show the form for creating a new course.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Instructor/Courses/Create', [
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created course in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:courses',
            'description' => 'required|string',
            'short_description' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'level' => 'required|string|max:50',
            'language' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'thumbnail' => 'nullable|image|max:2048',
            'promotional_video' => 'nullable|string|max:255',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'requirements' => 'nullable|array',
            'what_you_will_learn' => 'nullable|array',
            'who_is_this_course_for' => 'nullable|array',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('courses/thumbnails', 'public');
            $validated['thumbnail'] = $path;
        }

        $validated['user_id'] = Auth::id();

        $course = Course::create($validated);

        return redirect()->route('instructor.courses.show', $course->id)
            ->with('success', 'Course created successfully');
    }

    /**
     * Display the specified course.
     *
     * @param  \App\Models\Course  $course
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function show(Course $course, Request $request)
    {
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to view this course');
        }

        $course->load(['category', 'lessons' => function ($query) {
            $query->orderBy('order');
        }]);

        $course->loadCount(['enrollments', 'reviews', 'lessons']);

        $course->load(['enrollments' => function ($query) {
            $query->with('user');
        }]);

        $enrollmentStats = Enrollment::where('course_id', $course->id)
            ->selectRaw('COUNT(*) as total, SUM(CASE WHEN created_at >= NOW() - INTERVAL 30 DAY THEN 1 ELSE 0 END) as last_30_days')
            ->first();

        $course->load(['reviews' => function($query) {
            $query->where('is_approved', true)
                  ->with('user');
        }]);

        return Inertia::render('Instructor/Courses/Show', [
            'course' => $course,
            'stats' => [
                'totalEnrollments' => $enrollmentStats->total ?? 0,
                'recentEnrollments' => $enrollmentStats->last_30_days ?? 0,
                'averageRating' => round($course->average_rating, 1),
                'lessons_count' => $course->lessons_count,
                'enrollments_count' => $course->enrollments_count,
            ],
            'activeTab' => $request->input('tab', 'overview')
        ]);
    }

    /**
     * Show the form for editing the specified course.
     *
     * @param  \App\Models\Course  $course
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function edit(Course $course)
    {
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to edit this course');
        }

        $categories = Category::orderBy('name')->get();


        return Inertia::render('Instructor/Courses/Edit', [
            'course' => $course,
            'categories' => $categories
        ]);
    }

    /**
     * Update the specified course in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Course $course)
    {
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to update this course');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:courses,slug,' . $course->id,
            'description' => 'required|string',
            'short_description' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'level' => 'required|string|max:50',
            'language' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'thumbnail' => 'nullable|image|max:2048',
            'promotional_video' => 'nullable|string|max:255',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'requirements' => 'nullable|array',
            'what_you_will_learn' => 'nullable|array',
            'who_is_this_course_for' => 'nullable|array',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        if ($request->hasFile('thumbnail')) {
            if ($course->thumbnail) {
                Storage::disk('public')->delete($course->thumbnail);
            }

            $path = $request->file('thumbnail')->store('courses/thumbnails', 'public');
            $validated['thumbnail'] = $path;
        }

        $course->update($validated);

        return redirect()->route('instructor.courses.show', $course->id)
            ->with('success', 'Course updated successfully');
    }

    /**
     * Remove the specified course from storage.
     *
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Course $course)
    {
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to delete this course');
        }

        $enrollmentsCount = $course->enrollments()->count();
        if ($enrollmentsCount > 0) {
            return redirect()->route('instructor.courses.show', $course->id)
                ->with('error', 'Cannot delete course with active enrollments');
        }

        if ($course->thumbnail) {
            Storage::disk('public')->delete($course->thumbnail);
        }

        $course->delete();

        return redirect()->route('instructor.courses.index')
            ->with('success', 'Course deleted successfully');
    }

    /**
     * Display a listing of the students enrolled in the course.
     *
     * @param  \App\Models\Course  $course
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function students(Request $request, Course $course)
    {
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to view this course');
        }

        $query = Enrollment::where('course_id', $course->id)
            ->with(['user', 'course']);

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('date_range') && $request->get('date_range') !== 'all') {
            $dateRange = $request->get('date_range');
            if ($dateRange === 'last_week') {
                $query->where('created_at', '>=', now()->subWeek());
            } elseif ($dateRange === 'last_month') {
                $query->where('created_at', '>=', now()->subMonth());
            } elseif ($dateRange === 'last_3_months') {
                $query->where('created_at', '>=', now()->subMonths(3));
            } elseif ($dateRange === 'last_6_months') {
                $query->where('created_at', '>=', now()->subMonths(6));
            } elseif ($dateRange === 'last_year') {
                $query->where('created_at', '>=', now()->subYear());
            }
        }

        if ($request->has('sort') && $request->sort) {
            $sortField = 'created_at';
            $sortDirection = 'desc';

            if ($request->sort === 'created_at_asc') {
                $sortField = 'created_at';
                $sortDirection = 'asc';
            } elseif ($request->sort === 'created_at_desc') {
                $sortField = 'created_at';
                $sortDirection = 'desc';
            } elseif ($request->sort === 'user.name_asc') {
                $query->join('users', 'enrollments.user_id', '=', 'users.id')
                      ->orderBy('users.name', 'asc')
                      ->select('enrollments.*');
                $sortField = null;
            } elseif ($request->sort === 'user.name_desc') {
                $query->join('users', 'enrollments.user_id', '=', 'users.id')
                      ->orderBy('users.name', 'desc')
                      ->select('enrollments.*');
                $sortField = null;
            }

            if ($sortField) {
                $query->orderBy($sortField, $sortDirection);
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $enrollments = $query->paginate(10)->withQueryString();

        $totalEnrollments = Enrollment::where('course_id', $course->id)->count();
        $recentEnrollments = Enrollment::where('course_id', $course->id)
            ->where('created_at', '>=', now()->subDays(30))
            ->count();
        $activeStudents = Enrollment::where('course_id', $course->id)
            ->where('last_activity_at', '>=', now()->subDays(30))
            ->count();

        $completedCount = Enrollment::where('course_id', $course->id)
            ->whereNotNull('completed_at')
            ->count();
        $completionRate = $totalEnrollments > 0 ? round(($completedCount / $totalEnrollments) * 100) : 0;

        return Inertia::render('Instructor/Courses/Students', [
            'course' => $course,
            'enrollments' => $enrollments,
            'filters' => [
                'search' => $request->input('search', ''),
                'date_range' => $request->input('date_range', 'all'),
                'sort' => $request->input('sort', 'created_at_desc'),
            ],
            'stats' => [
                'totalEnrollments' => $totalEnrollments,
                'recentEnrollments' => $recentEnrollments,
                'activeStudents' => $activeStudents,
                'completionRate' => $completionRate,
            ]
        ]);
    }

    /**
     * Toggle the published status of the course.
     *
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\RedirectResponse
     */
    public function togglePublish(Course $course)
    {
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to update this course');
        }

        if (!$course->is_published && $course->lessons()->count() === 0) {
            return redirect()->route('instructor.courses.show', $course->id)
                ->with('error', 'Cannot publish a course without lessons');
        }

        $course->update([
            'is_published' => !$course->is_published
        ]);

        $status = $course->is_published ? 'published' : 'unpublished';

        return redirect()->route('instructor.courses.show', $course->id)
            ->with('success', "Course {$status} successfully");
    }
}
