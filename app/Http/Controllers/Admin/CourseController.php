<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Display a listing of courses.
     */
    public function index(Request $request)
    {
        $query = Course::query()
            ->with(['user', 'category'])
            ->withCount(['lessons', 'enrollments', 'reviews']);

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

        if ($request->has('status')) {
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
            } elseif ($request->sort === 'price_asc') {
                $sortField = 'price';
                $sortDirection = 'asc';
            } elseif ($request->sort === 'price_desc') {
                $sortField = 'price';
                $sortDirection = 'desc';
            } elseif ($request->sort === 'enrollments_desc') {
                $sortField = 'enrollments_count';
                $sortDirection = 'desc';
            } elseif ($request->sort === 'enrollments_asc') {
                $sortField = 'enrollments_count';
                $sortDirection = 'asc';
            }

            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $courses = $query->paginate(10)->withQueryString();

        foreach ($courses as $course) {
            $course->append('average_rating');
        }

        $categories = Category::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/Courses/Index', [
            'courses' => $courses,
            'categories' => $categories,
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', 'all'),
                'status' => $request->input('status', 'all'),
                'sort' => $request->input('sort', 'created_at_desc'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new course.
     */
    public function create()
    {
        $categories = Category::select('id', 'name')->orderBy('name')->get();
        $instructors = User::where('role', 'instructor')->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/Courses/Create', [
            'categories' => $categories,
            'instructors' => $instructors,
        ]);
    }

    /**
     * Store a newly created course in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'short_description' => 'required|string|max:500',
            'price' => 'required|numeric|min:0',
            'level' => 'required|string|in:beginner,intermediate,advanced,all-levels',
            'language' => 'required|string|max:50',
            'requirements' => 'nullable|array',
            'what_you_will_learn' => 'nullable|array',
            'who_is_this_course_for' => 'nullable|array',
            'thumbnail' => 'nullable|image|max:2048',
            'promotional_video' => 'nullable|string|max:255',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'is_approved' => 'boolean',
        ]);

        // Generate slug from title
        $validated['slug'] = Str::slug($validated['title']);

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            $thumbnail = $request->file('thumbnail');
            $thumbnailPath = $thumbnail->store('thumbnails', 'public');
            $validated['thumbnail'] = $thumbnailPath;
        }

        Course::create($validated);

        return redirect()->route('admin.courses.index')->with('success', 'Course created successfully.');
    }

    /**
     * Display the specified course.
     */
    public function show(Course $course, Request $request)
    {
        $course->load(['user', 'category']);
        $course->loadCount(['lessons', 'enrollments', 'reviews']);

        $tab = $request->input('tab', 'overview');

        if ($tab === 'lessons') {
            $lessons = $course->lessons()
                ->orderBy('order')
                ->paginate(20)
                ->withQueryString();

            $course->setRelation('lessons', $lessons);
        }

        if ($tab === 'enrollments') {
            $enrollments = $course->enrollments()
                ->with('user')
                ->latest()
                ->paginate(10)
                ->withQueryString();

            $course->setRelation('enrollments', $enrollments);
        }

        if ($tab === 'reviews') {
            $reviews = $course->reviews()
                ->with('user')
                ->latest()
                ->paginate(10)
                ->withQueryString();

            $course->setRelation('reviews', $reviews);
        }

        // Add average rating as an appended attribute
        $course->append('average_rating');

        return Inertia::render('Admin/Courses/Show', [
            'course' => $course,
            'tab' => $tab,
        ]);
    }

    /**
     * Show the form for editing the specified course.
     */
    public function edit(Course $course)
    {
        $course->load(['user', 'category']);
        $categories = Category::select('id', 'name')->orderBy('name')->get();
        $instructors = User::where('role', 'instructor')->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/Courses/Edit', [
            'course' => $course,
            'categories' => $categories,
            'instructors' => $instructors,
        ]);
    }

    /**
     * Update the specified course in storage.
     */
    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'short_description' => 'required|string|max:500',
            'price' => 'required|numeric|min:0',
            'level' => 'required|string|in:beginner,intermediate,advanced,all-levels',
            'language' => 'required|string|max:50',
            'requirements' => 'nullable|array',
            'what_you_will_learn' => 'nullable|array',
            'who_is_this_course_for' => 'nullable|array',
            'thumbnail' => 'nullable|image|max:2048',
            'promotional_video' => 'nullable|string|max:255',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'is_approved' => 'boolean',
        ]);

        // Update slug only if title has changed
        if ($course->title !== $validated['title']) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            // Delete the old thumbnail if it exists
            if ($course->thumbnail && Storage::disk('public')->exists($course->thumbnail)) {
                Storage::disk('public')->delete($course->thumbnail);
            }

            $thumbnail = $request->file('thumbnail');
            $thumbnailPath = $thumbnail->store('thumbnails', 'public');
            $validated['thumbnail'] = $thumbnailPath;
        }

        $course->update($validated);

        return redirect()->route('admin.courses.edit', $course)->with('success', 'Course updated successfully.');
    }

    /**
     * Remove the specified course from storage.
     */
    public function destroy(Course $course)
    {
        // Check if the course has enrollments
        if ($course->enrollments()->count() > 0) {
            return redirect()->route('admin.courses.index')->with('error', 'This course has enrollments and cannot be deleted.');
        }

        // Delete the thumbnail if it exists
        if ($course->thumbnail && Storage::disk('public')->exists($course->thumbnail)) {
            Storage::disk('public')->delete($course->thumbnail);
        }

        // Delete lessons and associated content
        foreach ($course->lessons as $lesson) {
            // Delete quizzes and questions
            foreach ($lesson->quizzes as $quiz) {
                $quiz->questions()->delete();
                $quiz->delete();
            }

            // Delete assignments
            $lesson->assignments()->delete();

            $lesson->delete();
        }

        // Delete reviews
        $course->reviews()->delete();

        // Delete the course
        $course->delete();

        return redirect()->route('admin.courses.index')->with('success', 'Course deleted successfully.');
    }

    /**
     * Approve or unapprove a course.
     */
    public function approve(Course $course)
    {
        $course->update([
            'is_approved' => !$course->is_approved,
        ]);

        $status = $course->is_approved ? 'approved' : 'unapproved';

        return back()->with('success', "Course {$status} successfully.");
    }

    /**
     * Feature or unfeature a course.
     */
    public function feature(Course $course)
    {
        $course->update([
            'is_featured' => !$course->is_featured,
        ]);

        $status = $course->is_featured ? 'featured' : 'unfeatured';

        return back()->with('success', "Course {$status} successfully.");
    }
}
