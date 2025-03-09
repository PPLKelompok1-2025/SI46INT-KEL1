<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LessonController extends Controller
{
    /**
     * Display a listing of the lessons for a course.
     *
     * @param  \App\Models\Course  $course
     * @return \Inertia\Response
     */
    public function index(Course $course)
    {
        // Ensure the instructor owns this course
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to view lessons for this course');
        }

        $lessons = $course->lessons()
            ->orderBy('order')
            ->get();

        return Inertia::render('Instructor/Lessons/Index', [
            'course' => $course,
            'lessons' => $lessons
        ]);
    }

    /**
     * Show the form for creating a new lesson.
     *
     * @param  \App\Models\Course  $course
     * @return \Inertia\Response
     */
    public function create(Course $course)
    {
        // Ensure the instructor owns this course
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to add lessons to this course');
        }

        // Get the highest order value to set the new lesson's order
        $maxOrder = $course->lessons()->max('order') ?? 0;

        return Inertia::render('Instructor/Lessons/Create', [
            'course' => $course,
            'nextOrder' => $maxOrder + 1
        ]);
    }

    /**
     * Store a newly created lesson in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request, Course $course)
    {
        // Ensure the instructor owns this course
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to add lessons to this course');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'video_url' => 'nullable|string|max:255',
            'duration' => 'nullable|integer|min:0',
            'order' => 'required|integer|min:1',
            'is_free' => 'boolean',
            'is_published' => 'boolean',
            'section' => 'nullable|string|max:255',
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Add course ID
        $validated['course_id'] = $course->id;

        $lesson = Lesson::create($validated);

        return redirect()->route('instructor.courses.lessons.index', $course->id)
            ->with('success', 'Lesson created successfully');
    }

    /**
     * Display the specified lesson.
     *
     * @param  \App\Models\Lesson  $lesson
     * @return \Inertia\Response
     */
    public function show(Lesson $lesson)
    {
        $course = $lesson->course;

        // Ensure the instructor owns this course
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to view this lesson');
        }

        return Inertia::render('Instructor/Lessons/Show', [
            'lesson' => $lesson,
            'course' => $course
        ]);
    }

    /**
     * Show the form for editing the specified lesson.
     *
     * @param  \App\Models\Lesson  $lesson
     * @return \Inertia\Response
     */
    public function edit(Lesson $lesson)
    {
        $course = $lesson->course;

        // Ensure the instructor owns this course
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to edit this lesson');
        }

        return Inertia::render('Instructor/Lessons/Edit', [
            'lesson' => $lesson,
            'course' => $course
        ]);
    }

    /**
     * Update the specified lesson in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Lesson  $lesson
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Lesson $lesson)
    {
        $course = $lesson->course;

        // Ensure the instructor owns this course
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to update this lesson');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'video_url' => 'nullable|string|max:255',
            'duration' => 'nullable|integer|min:0',
            'order' => 'required|integer|min:1',
            'is_free' => 'boolean',
            'is_published' => 'boolean',
            'section' => 'nullable|string|max:255',
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $lesson->update($validated);

        return redirect()->route('instructor.courses.lessons.index', $course->id)
            ->with('success', 'Lesson updated successfully');
    }

    /**
     * Remove the specified lesson from storage.
     *
     * @param  \App\Models\Lesson  $lesson
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Lesson $lesson)
    {
        $course = $lesson->course;

        // Ensure the instructor owns this course
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to delete this lesson');
        }

        // Delete the lesson
        $lesson->delete();

        // Reorder remaining lessons
        $remainingLessons = $course->lessons()->orderBy('order')->get();
        foreach ($remainingLessons as $index => $remainingLesson) {
            $remainingLesson->update(['order' => $index + 1]);
        }

        return redirect()->route('instructor.courses.lessons.index', $course->id)
            ->with('success', 'Lesson deleted successfully');
    }

    /**
     * Reorder lessons for a course.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\JsonResponse
     */
    public function reorder(Request $request, Course $course)
    {
        // Ensure the instructor owns this course
        if ($course->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'lessons' => 'required|array',
            'lessons.*.id' => 'required|exists:lessons,id',
            'lessons.*.order' => 'required|integer|min:1',
        ]);

        foreach ($validated['lessons'] as $lessonData) {
            $lesson = Lesson::find($lessonData['id']);

            // Ensure the lesson belongs to this course
            if ($lesson->course_id === $course->id) {
                $lesson->update(['order' => $lessonData['order']]);
            }
        }

        return response()->json(['success' => true]);
    }
}
