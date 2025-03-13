<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Review;
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
        ->get();

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

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('courses/thumbnails', 'public');
            $validated['thumbnail'] = $path;
        }

        // Add instructor ID
        $validated['user_id'] = Auth::id();

        // Convert arrays to JSON
        if (isset($validated['requirements'])) {
            $validated['requirements'] = json_encode($validated['requirements']);
        }

        if (isset($validated['what_you_will_learn'])) {
            $validated['what_you_will_learn'] = json_encode($validated['what_you_will_learn']);
        }

        if (isset($validated['who_is_this_course_for'])) {
            $validated['who_is_this_course_for'] = json_encode($validated['who_is_this_course_for']);
        }

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
        // Ensure the instructor owns this course
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to view this course');
        }

        $course->load(['category', 'lessons' => function ($query) {
            $query->orderBy('order');
        }]);

        $course->loadCount(['enrollments', 'reviews', 'lessons']);

        // Get enrollment statistics
        // PostgreSQL version of the date calculation
        $enrollmentStats = Enrollment::where('course_id', $course->id)
            ->selectRaw('COUNT(*) as total, SUM(CASE WHEN created_at >= NOW() - INTERVAL \'30 days\' THEN 1 ELSE 0 END) as last_30_days')
            ->first();

        // Load reviews to use the average_rating accessor
        $course->load(['reviews' => function($query) {
            $query->where('is_approved', true);
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
        // Ensure the instructor owns this course
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to edit this course');
        }

        $categories = Category::orderBy('name')->get();

        // Convert JSON arrays back to PHP arrays for the form
        if ($course->requirements) {
            $course->requirements = json_decode($course->requirements);
        }

        if ($course->what_you_will_learn) {
            $course->what_you_will_learn = json_decode($course->what_you_will_learn);
        }

        if ($course->who_is_this_course_for) {
            $course->who_is_this_course_for = json_decode($course->who_is_this_course_for);
        }

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
        // Ensure the instructor owns this course
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

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail if exists
            if ($course->thumbnail) {
                Storage::disk('public')->delete($course->thumbnail);
            }

            $path = $request->file('thumbnail')->store('courses/thumbnails', 'public');
            $validated['thumbnail'] = $path;
        }

        // Convert arrays to JSON
        if (isset($validated['requirements'])) {
            $validated['requirements'] = json_encode($validated['requirements']);
        }

        if (isset($validated['what_you_will_learn'])) {
            $validated['what_you_will_learn'] = json_encode($validated['what_you_will_learn']);
        }

        if (isset($validated['who_is_this_course_for'])) {
            $validated['who_is_this_course_for'] = json_encode($validated['who_is_this_course_for']);
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
        // Ensure the instructor owns this course
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to delete this course');
        }

        // Check if course has enrollments
        $enrollmentsCount = $course->enrollments()->count();
        if ($enrollmentsCount > 0) {
            return redirect()->route('instructor.courses.show', $course->id)
                ->with('error', 'Cannot delete course with active enrollments');
        }

        // Delete thumbnail if exists
        if ($course->thumbnail) {
            Storage::disk('public')->delete($course->thumbnail);
        }

        // Delete course
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
        // Ensure the instructor owns this course
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
        // Ensure the instructor owns this course
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to update this course');
        }

        // Check if course has lessons before publishing
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
