<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Lesson;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    /**
     * Display a listing of the assignments.
     *
     * @param  \App\Models\Lesson  $lesson
     * @return \Inertia\Response
     */
    public function index(Lesson $lesson)
    {
        // Ensure the instructor owns the course this lesson belongs to
        $this->authorize('view', $lesson);

        $assignments = $lesson->assignments()->orderBy('created_at', 'desc')->get();

        return Inertia::render('Instructor/Assignments/Index', [
            'lesson' => $lesson->load('course'),
            'assignments' => $assignments
        ]);
    }

    /**
     * Show the form for creating a new assignment.
     *
     * @param  \App\Models\Lesson  $lesson
     * @return \Inertia\Response
     */
    public function create(Lesson $lesson)
    {
        // Ensure the instructor owns the course this lesson belongs to
        $this->authorize('view', $lesson);

        return Inertia::render('Instructor/Assignments/Create', [
            'lesson' => $lesson->load('course')
        ]);
    }

    /**
     * Store a newly created assignment in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Lesson  $lesson
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request, Lesson $lesson)
    {
        // Ensure the instructor owns the course this lesson belongs to
        $this->authorize('view', $lesson);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'due_date' => 'required|date|after:today',
            'max_score' => 'required|integer|min:1',
            'file' => 'nullable|file|max:10240', // 10MB max
        ]);

        $assignment = new Assignment();
        $assignment->lesson_id = $lesson->id;
        $assignment->title = $validated['title'];
        $assignment->description = $validated['description'];
        $assignment->due_date = $validated['due_date'];
        $assignment->max_score = $validated['max_score'];

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('assignments', 'public');
            $assignment->file_path = $path;
        }

        $assignment->save();

        return redirect()->route('instructor.courses.lessons.assignments.index', [
            'course' => $lesson->course_id,
            'lesson' => $lesson->id
        ])->with('success', 'Assignment created successfully');
    }

    /**
     * Display the specified assignment.
     *
     * @param  \App\Models\Lesson  $lesson
     * @param  \App\Models\Assignment  $assignment
     * @return \Inertia\Response
     */
    public function show(Lesson $lesson, Assignment $assignment)
    {
        // Ensure the instructor owns the course this lesson belongs to
        $this->authorize('view', $lesson);

        // Ensure the assignment belongs to the lesson
        if ($assignment->lesson_id !== $lesson->id) {
            abort(404);
        }

        return Inertia::render('Instructor/Assignments/Show', [
            'lesson' => $lesson->load('course'),
            'assignment' => $assignment
        ]);
    }

    /**
     * Show the form for editing the specified assignment.
     *
     * @param  \App\Models\Lesson  $lesson
     * @param  \App\Models\Assignment  $assignment
     * @return \Inertia\Response
     */
    public function edit(Lesson $lesson, Assignment $assignment)
    {
        // Ensure the instructor owns the course this lesson belongs to
        $this->authorize('view', $lesson);

        // Ensure the assignment belongs to the lesson
        if ($assignment->lesson_id !== $lesson->id) {
            abort(404);
        }

        return Inertia::render('Instructor/Assignments/Edit', [
            'lesson' => $lesson->load('course'),
            'assignment' => $assignment
        ]);
    }

    /**
     * Update the specified assignment in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Lesson  $lesson
     * @param  \App\Models\Assignment  $assignment
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Lesson $lesson, Assignment $assignment)
    {
        // Ensure the instructor owns the course this lesson belongs to
        $this->authorize('view', $lesson);

        // Ensure the assignment belongs to the lesson
        if ($assignment->lesson_id !== $lesson->id) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'due_date' => 'required|date',
            'max_score' => 'required|integer|min:1',
            'file' => 'nullable|file|max:10240', // 10MB max
        ]);

        $assignment->title = $validated['title'];
        $assignment->description = $validated['description'];
        $assignment->due_date = $validated['due_date'];
        $assignment->max_score = $validated['max_score'];

        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($assignment->file_path) {
                Storage::disk('public')->delete($assignment->file_path);
            }

            $path = $request->file('file')->store('assignments', 'public');
            $assignment->file_path = $path;
        }

        $assignment->save();

        return redirect()->route('instructor.courses.lessons.assignments.index', [
            'course' => $lesson->course_id,
            'lesson' => $lesson->id
        ])->with('success', 'Assignment updated successfully');
    }

    /**
     * Remove the specified assignment from storage.
     *
     * @param  \App\Models\Lesson  $lesson
     * @param  \App\Models\Assignment  $assignment
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Lesson $lesson, Assignment $assignment)
    {
        // Ensure the instructor owns the course this lesson belongs to
        $this->authorize('view', $lesson);

        // Ensure the assignment belongs to the lesson
        if ($assignment->lesson_id !== $lesson->id) {
            abort(404);
        }

        // Delete file if exists
        if ($assignment->file_path) {
            Storage::disk('public')->delete($assignment->file_path);
        }

        $assignment->delete();

        return redirect()->route('instructor.courses.lessons.assignments.index', [
            'course' => $lesson->course_id,
            'lesson' => $lesson->id
        ])->with('success', 'Assignment deleted successfully');
    }

    /**
     * Display all submissions across all assignments.
     *
     * @return \Inertia\Response
     */
    public function allSubmissions()
    {
        $instructor = Auth::user();

        // Get all assignments from courses owned by this instructor
        $assignments = Assignment::whereHas('lesson.course', function ($query) use ($instructor) {
            $query->where('user_id', $instructor->id);
        })->with('lesson.course')->get();

        $assignmentIds = $assignments->pluck('id');

        $submissions = AssignmentSubmission::whereIn('assignment_id', $assignmentIds)
            ->with(['assignment.lesson.course', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Instructor/Assignments/AllSubmissions', [
            'submissions' => $submissions
        ]);
    }

    /**
     * Display submissions for a specific assignment.
     *
     * @param  \App\Models\Assignment  $assignment
     * @return \Inertia\Response
     */
    public function submissions(Assignment $assignment)
    {
        // Ensure the instructor owns the course this assignment belongs to
        $this->authorize('view', $assignment->lesson);

        $submissions = $assignment->submissions()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Instructor/Assignments/Submissions', [
            'assignment' => $assignment->load('lesson.course'),
            'submissions' => $submissions
        ]);
    }

    /**
     * Grade a submission.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\AssignmentSubmission  $submission
     * @return \Illuminate\Http\RedirectResponse
     */
    public function gradeSubmission(Request $request, AssignmentSubmission $submission)
    {
        // Ensure the instructor owns the course this submission belongs to
        $this->authorize('view', $submission->assignment->lesson);

        $validated = $request->validate([
            'score' => 'required|integer|min:0|max:' . $submission->assignment->max_score,
            'feedback' => 'nullable|string'
        ]);

        $submission->score = $validated['score'];
        $submission->feedback = $validated['feedback'] ?? null;
        $submission->graded_at = now();
        $submission->save();

        return redirect()->back()->with('success', 'Submission graded successfully');
    }
}
