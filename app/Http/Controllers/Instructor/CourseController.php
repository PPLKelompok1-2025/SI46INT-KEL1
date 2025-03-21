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
    public function index()
    {
        $instructor = Auth::user();

        $courses = Course::where('user_id', $instructor->id)
            ->withCount(['lessons', 'enrollments', 'reviews'])
            ->with('category')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $courses->each(function ($course) {
            $course->average_rating = $course->getAverageRatingAttribute();
        });

        return Inertia::render('Instructor/Courses/Index', [
            'courses' => $courses
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
    public function show(Course $course)
    {
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to view this course');
        }

        $course->load(['category', 'lessons' => function ($query) {
            $query->orderBy('order');
        }]);

        $course->loadCount(['enrollments', 'reviews', 'lessons']);

        $enrollmentStats = Enrollment::where('course_id', $course->id)
            ->selectRaw('COUNT(*) as total, SUM(CASE WHEN created_at >= NOW() - INTERVAL \'30 days\' THEN 1 ELSE 0 END) as last_30_days')
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
            ]
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
    public function students(Course $course)
    {
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to view this course');
        }

        $enrollments = Enrollment::where('course_id', $course->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Instructor/Courses/Students', [
            'course' => $course,
            'enrollments' => $enrollments
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
