<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NoteController extends Controller
{
    /**
     * Display a listing of the student's notes.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $user = Auth::user();

        $notes = Note::where('user_id', $user->id)
            ->with('course')
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('Student/Notes/Index', [
            'notes' => $notes
        ]);
    }

    /**
     * Show the form for creating a new note.
     *
     * @param  \App\Models\Course  $course
     * @return \Inertia\Response
     */
    public function create(Course $course)
    {
        // Check if the user is enrolled in the course
        $user = Auth::user();
        $isEnrolled = $user->enrollments()->where('course_id', $course->id)->exists();

        if (!$isEnrolled) {
            return redirect()->route('student.courses.show', $course->slug)
                ->with('error', 'You must be enrolled in this course to create notes.');
        }

        // Check if a note already exists
        $existingNote = Note::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existingNote) {
            return redirect()->route('student.notes.edit', $existingNote->id);
        }

        return Inertia::render('Student/Notes/Create', [
            'course' => $course
        ]);
    }

    /**
     * Store a newly created note in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request, Course $course)
    {
        $request->validate([
            'content' => 'required|string'
        ]);

        $user = Auth::user();

        // Check if the user is enrolled in the course
        $isEnrolled = $user->enrollments()->where('course_id', $course->id)->exists();

        if (!$isEnrolled) {
            return redirect()->route('student.courses.show', $course->slug)
                ->with('error', 'You must be enrolled in this course to create notes.');
        }

        // Check if a note already exists
        $existingNote = Note::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existingNote) {
            $existingNote->update([
                'content' => $request->content
            ]);

            return redirect()->route('student.notes.index')
                ->with('success', 'Note updated successfully.');
        }

        // Create a new note
        Note::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'content' => $request->content
        ]);

        return redirect()->route('student.notes.index')
            ->with('success', 'Note created successfully.');
    }

    /**
     * Show the form for editing the specified note.
     *
     * @param  \App\Models\Note  $note
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function edit(Note $note)
    {
        $user = Auth::user();

        // Check if the note belongs to the user
        if ($note->user_id !== $user->id) {
            return redirect()->route('student.notes.index')
                ->with('error', 'You do not have permission to edit this note.');
        }

        $note->load('course');

        return Inertia::render('Student/Notes/Edit', [
            'note' => $note
        ]);
    }

    /**
     * Update the specified note in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Note  $note
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Note $note)
    {
        $request->validate([
            'content' => 'required|string'
        ]);

        $user = Auth::user();

        // Check if the note belongs to the user
        if ($note->user_id !== $user->id) {
            return redirect()->route('student.notes.index')
                ->with('error', 'You do not have permission to edit this note.');
        }

        $note->update([
            'content' => $request->content
        ]);

        return redirect()->route('student.notes.index')
            ->with('success', 'Note updated successfully.');
    }

    /**
     * Remove the specified note from storage.
     *
     * @param  \App\Models\Note  $note
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Note $note)
    {
        $user = Auth::user();

        // Check if the note belongs to the user
        if ($note->user_id !== $user->id) {
            return redirect()->route('student.notes.index')
                ->with('error', 'You do not have permission to delete this note.');
        }

        $note->delete();

        return redirect()->route('student.notes.index')
            ->with('success', 'Note deleted successfully.');
    }
}
