<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    /**
     * Display the specified assignment.
     *
     * @param  \App\Models\Assignment  $assignment
     * @return \Inertia\Response
     */
    public function show(Assignment $assignment)
    {
        $lesson = $assignment->lesson;
        $course = $lesson->course;

        // Check if the student is enrolled in the course
        $isEnrolled = $course->enrollments()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isEnrolled) {
            return redirect()->route('courses.show', $course->slug)
                ->with('error', 'You must be enrolled in this course to access assignments.');
        }

        // Get the current user's submission for this assignment if any
        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('user_id', Auth::id())
            ->first();

        // Check if the assignment is past due
        $isPastDue = $assignment->due_date && now() > $assignment->due_date;

        return Inertia::render('Student/Assignments/Show', [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'points' => $assignment->points,
                'due_date' => $assignment->due_date,
                'file_path' => $assignment->file_path,
                'is_past_due' => $isPastDue,
            ],
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
            ],
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
            ],
            'submission' => $submission ? [
                'id' => $submission->id,
                'submission_text' => $submission->submission_text,
                'file_path' => $submission->file_path,
                'score' => $submission->score,
                'feedback' => $submission->feedback,
                'submitted_at' => $submission->submitted_at,
                'graded_at' => $submission->graded_at,
            ] : null,
        ]);
    }

    /**
     * Submit an assignment.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Assignment  $assignment
     * @return \Illuminate\Http\RedirectResponse
     */
    public function submit(Request $request, Assignment $assignment)
    {
        $lesson = $assignment->lesson;
        $course = $lesson->course;

        // Check if the student is enrolled in the course
        $isEnrolled = $course->enrollments()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isEnrolled) {
            return redirect()->route('courses.show', $course->slug)
                ->with('error', 'You must be enrolled in this course to submit assignments.');
        }

        // Check if the assignment is past due
        if ($assignment->due_date && now() > $assignment->due_date) {
            return redirect()->back()->with('error', 'This assignment is past the due date and can no longer be submitted.');
        }

        // Validate the submission
        $request->validate([
            'submission_text' => 'nullable|string',
            'file' => 'nullable|file|max:10240', // 10MB max
        ]);

        // Check if there's an existing submission
        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('user_id', Auth::id())
            ->first();

        if ($submission) {
            // Update existing submission
            if ($request->has('submission_text')) {
                $submission->submission_text = $request->submission_text;
            }

            if ($request->hasFile('file')) {
                // Delete old file if exists
                if ($submission->file_path) {
                    Storage::disk('public')->delete($submission->file_path);
                }

                $path = $request->file('file')->store('submissions', 'public');
                $submission->file_path = $path;
            }

            $submission->submitted_at = now();
            $submission->save();
        } else {
            // Create new submission
            $submission = new AssignmentSubmission();
            $submission->assignment_id = $assignment->id;
            $submission->user_id = Auth::id();
            $submission->submission_text = $request->submission_text;
            $submission->submitted_at = now();

            if ($request->hasFile('file')) {
                $path = $request->file('file')->store('submissions', 'public');
                $submission->file_path = $path;
            }

            $submission->save();
        }

        return redirect()->back()->with('success', 'Assignment submitted successfully!');
    }

    /**
     * Show the graded feedback for an assignment submission.
     *
     * @param  \App\Models\Assignment  $assignment
     * @return \Inertia\Response
     */
    public function feedback(Assignment $assignment)
    {
        $lesson = $assignment->lesson;
        $course = $lesson->course;

        // Check if the student is enrolled in the course
        $isEnrolled = $course->enrollments()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isEnrolled) {
            return redirect()->route('courses.show', $course->slug)
                ->with('error', 'You must be enrolled in this course to access assignment feedback.');
        }

        // Get the current user's submission for this assignment
        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$submission) {
            return redirect()->route('student.assignments.show', $assignment->id)
                ->with('error', 'You have not submitted this assignment yet.');
        }

        return Inertia::render('Student/Assignments/Feedback', [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'points' => $assignment->points,
                'due_date' => $assignment->due_date,
            ],
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
            ],
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
            ],
            'submission' => [
                'id' => $submission->id,
                'submission_text' => $submission->submission_text,
                'file_path' => $submission->file_path,
                'score' => $submission->score,
                'feedback' => $submission->feedback,
                'submitted_at' => $submission->submitted_at,
                'graded_at' => $submission->graded_at,
            ],
        ]);
    }

    /**
     * Download the submission file for an assignment.
     *
     * @param  \App\Models\AssignmentSubmission  $submission
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function downloadSubmission(AssignmentSubmission $submission)
    {
        // Ensure the authenticated user is the one who made the submission
        if (Auth::id() !== $submission->user_id) {
            abort(403, 'Unauthorized action.');
        }

        if (!$submission->file_path || !Storage::disk('public')->exists($submission->file_path)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('public')->download($submission->file_path);
    }

    /**
     * Download the materials file for an assignment.
     *
     * @param  \App\Models\Assignment  $assignment
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function downloadAssignmentMaterials(Assignment $assignment)
    {
        // Ensure the student is enrolled in the course to download materials
        $isEnrolled = $assignment->lesson->course->enrollments()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isEnrolled) {
            abort(403, 'Unauthorized action. You must be enrolled to download assignment materials.');
        }

        if (!$assignment->file_path || !Storage::disk('public')->exists($assignment->file_path)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('public')->download($assignment->file_path);
    }
}
