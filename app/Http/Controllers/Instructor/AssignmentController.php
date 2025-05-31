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
        if (Auth::id() !== $lesson->course->user_id) {
            abort(403, 'Unauthorized action.');
        }

        $assignments = $lesson->assignments()
            ->withCount('submissions')
            ->orderBy('created_at', 'desc')
            ->get();

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
        if (Auth::id() !== $lesson->course->user_id) {
            abort(403, 'Unauthorized action.');
        }

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
        if (Auth::id() !== $lesson->course->user_id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'due_date' => 'required|date',
            'points' => 'required|integer|min:1',
            'file' => 'nullable|file|max:10240', // 10MB max
        ]);

        $assignment = new Assignment();
        $assignment->lesson_id = $lesson->id;
        $assignment->title = $validated['title'];
        $assignment->description = $validated['description'];
        $assignment->due_date = $validated['due_date'];
        $assignment->points = $validated['points'];

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('assignments', 'public');
            $assignment->file_path = $path;
        }

        $assignment->save();

        return redirect()->route('instructor.lessons.assignments.index', [
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
        if (Auth::id() !== $lesson->course->user_id) {
            abort(403, 'Unauthorized action.');
        }

        // Ensure the assignment belongs to the lesson
        if ($assignment->lesson_id !== $lesson->id) {
            abort(404);
        }

        $assignment->loadCount('submissions');

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
        if (Auth::id() !== $lesson->course->user_id) {
            abort(403, 'Unauthorized action.');
        }

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
        if (Auth::id() !== $lesson->course->user_id) {
            abort(403, 'Unauthorized action.');
        }

        // Ensure the assignment belongs to the lesson
        if ($assignment->lesson_id !== $lesson->id) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'due_date' => 'required|date',
            'points' => 'required|integer|min:1',
            'file' => 'nullable|file|max:10240', // 10MB max
        ]);

        $assignment->title = $validated['title'];
        $assignment->description = $validated['description'];
        $assignment->due_date = $validated['due_date'];
        $assignment->points = $validated['points'];

        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($assignment->file_path) {
                Storage::disk('public')->delete($assignment->file_path);
            }

            $path = $request->file('file')->store('assignments', 'public');
            $assignment->file_path = $path;
        }

        $assignment->save();

        return redirect()->route('instructor.lessons.assignments.index', [
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
        if (Auth::id() !== $lesson->course->user_id) {
            abort(403, 'Unauthorized action.');
        }

        // Ensure the assignment belongs to the lesson
        if ($assignment->lesson_id !== $lesson->id) {
            abort(404);
        }

        // Delete file if exists
        if ($assignment->file_path) {
            Storage::disk('public')->delete($assignment->file_path);
        }

        $assignment->delete();

        return redirect()->route('instructor.lessons.assignments.index', [
            'lesson' => $lesson->id
        ])->with('success', 'Assignment deleted successfully');
    }

    /**
     * Display all submissions across all assignments.
     *
     * @return \Inertia\Response
     */
    // public function allSubmissions()
    // {
    //     $instructor = Auth::user();

    //     // Get all assignments from courses owned by this instructor
    //     $assignments = Assignment::whereHas('lesson.course', function ($query) use ($instructor) {
    //         $query->where('user_id', $instructor->id);
    //     })->with('lesson.course')->get();

    //     $assignmentIds = $assignments->pluck('id');

    //     $submissions = AssignmentSubmission::whereIn('assignment_id', $assignmentIds)
    //         ->with(['assignment.lesson.course', 'user'])
    //         ->orderBy('created_at', 'desc')
    //         ->paginate(20);

    //     return Inertia::render('Instructor/Assignments/AllSubmissions', [
    //         'submissions' => $submissions
    //     ]);
    // }

    /**
     * Display submissions for a specific assignment.
     *
     * @param  \App\Models\Assignment  $assignment
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function submissions(Request $request, Assignment $assignment)
    {
        // Ensure the instructor owns the course this assignment belongs to
        $lesson = $assignment->lesson;
        if (Auth::id() !== $lesson->course->user_id) {
            abort(403, 'Unauthorized action.');
        }

        $submissions = $assignment->submissions()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        $activeTab = $request->query('tab', 'all');

        return Inertia::render('Instructor/Assignments/Submissions', [
            'assignment' => $assignment->load('lesson.course'),
            'submissions' => $submissions,
            'activeTab' => $activeTab,
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
        $lesson = $submission->assignment->lesson;
        if (Auth::id() !== $lesson->course->user_id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'score' => 'required|integer|min:0|max:' . $submission->assignment->points,
            'feedback' => 'nullable|string'
        ]);

        $submission->score = $validated['score'];
        $submission->feedback = $validated['feedback'] ?? null;
        $submission->graded_at = now();
        $submission->save();

        return redirect()->back()->with('success', 'Submission graded successfully');
    }

    /**
     * Download the materials file for an assignment.
     *
     * @param  \App\Models\Assignment  $assignment
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function downloadAssignmentMaterials(Assignment $assignment)
    {
        // Ensure the authenticated user is the instructor of the course
        $instructorId = Auth::id();
        $courseInstructorId = $assignment->lesson->course->user_id;

        if ($instructorId !== $courseInstructorId) {
            abort(403, 'Unauthorized action.');
        }

        if (!$assignment->file_path || !Storage::disk('public')->exists($assignment->file_path)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('public')->download($assignment->file_path);
    }

    /**
     * Download the submission file for an assignment.
     *
     * @param  \App\Models\AssignmentSubmission  $submission
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function downloadSubmission(AssignmentSubmission $submission)
    {
        // Ensure the authenticated user is the instructor of the course
        $instructorId = Auth::id();
        $courseInstructorId = $submission->assignment->lesson->course->user_id;

        if ($instructorId !== $courseInstructorId) {
            abort(403, 'Unauthorized action.');
        }

        if (!$submission->file_path || !Storage::disk('public')->exists($submission->file_path)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('public')->download($submission->file_path);
    }
}