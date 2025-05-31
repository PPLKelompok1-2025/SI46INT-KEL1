<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Answer;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class QuestionController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Quiz $quiz)
    {
        $this->authorize('view', $quiz->lesson);

        $quiz->load(['questions' => function($query) {
            $query->with('answers')->orderBy('id');
        }]);

        $lesson = $quiz->lesson;
        $course = $lesson->course;

        return Inertia::render('Instructor/Questions/Index', [
            'quiz' => $quiz,
            'lesson' => $lesson,
            'course' => $course
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Quiz $quiz)
    {
        $this->authorize('update', $quiz->lesson);

        $lesson = $quiz->lesson;
        $course = $lesson->course;

        return Inertia::render('Instructor/Questions/Create', [
            'quiz' => $quiz,
            'lesson' => $lesson,
            'course' => $course,
            'questionTypes' => [
                'multiple_choice' => 'Multiple Choice',
                'true_false' => 'True/False'
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz->lesson);

        $validated = $request->validate([
            'question' => 'required|string',
            'type' => 'required|in:multiple_choice,true_false',
            'points' => 'required|integer|min:1',
            'answers' => 'required|array|min:2',
            'answers.*.answer' => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
        ]);

        // Ensure at least one answer is marked as correct
        $hasCorrectAnswer = false;
        foreach ($validated['answers'] as $answer) {
            if ($answer['is_correct']) {
                $hasCorrectAnswer = true;
                break;
            }
        }

        if (!$hasCorrectAnswer) {
            return back()->withErrors(['answers' => 'At least one answer must be marked as correct.']);
        }

        // If it's a true/false question, ensure there are exactly 2 answers
        if ($validated['type'] === 'true_false' && count($validated['answers']) !== 2) {
            return back()->withErrors(['answers' => 'True/False questions must have exactly 2 answers.']);
        }

        // Create question
        $question = Question::create([
            'quiz_id' => $quiz->id,
            'question' => $validated['question'],
            'type' => $validated['type'],
            'points' => $validated['points'],
        ]);

        // Create answers
        foreach ($validated['answers'] as $answerData) {
            Answer::create([
                'question_id' => $question->id,
                'answer' => $answerData['answer'],
                'is_correct' => $answerData['is_correct'],
            ]);
        }

        if ($request->input('addAnother')) {
            return redirect()->route('instructor.quizzes.questions.create', $quiz->id)
                ->with('success', 'Question added successfully.');
        }

        return redirect()->route('instructor.lessons.quizzes.show', [$quiz->lesson_id, $quiz->id])
            ->with('success', 'Question added successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Quiz $quiz, Question $question)
    {
        $this->authorize('update', $quiz->lesson);

        if ($question->quiz_id !== $quiz->id) {
            abort(404);
        }

        $question->load('answers');
        $lesson = $quiz->lesson;
        $course = $lesson->course;

        return Inertia::render('Instructor/Questions/Edit', [
            'quiz' => $quiz,
            'question' => $question,
            'lesson' => $lesson,
            'course' => $course,
            'questionTypes' => [
                'multiple_choice' => 'Multiple Choice',
                'true_false' => 'True/False'
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Quiz $quiz, Question $question)
    {
        $this->authorize('update', $quiz->lesson);

        if ($question->quiz_id !== $quiz->id) {
            abort(404);
        }

        $validated = $request->validate([
            'question' => 'required|string',
            'type' => 'required|in:multiple_choice,true_false',
            'points' => 'required|integer|min:1',
            'answers' => 'required|array|min:2',
            'answers.*.id' => 'nullable|integer|exists:answers,id',
            'answers.*.answer' => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
        ]);

        // Ensure at least one answer is marked as correct
        $hasCorrectAnswer = false;
        foreach ($validated['answers'] as $answer) {
            if ($answer['is_correct']) {
                $hasCorrectAnswer = true;
                break;
            }
        }

        if (!$hasCorrectAnswer) {
            return back()->withErrors(['answers' => 'At least one answer must be marked as correct.']);
        }

        // If it's a true/false question, ensure there are exactly 2 answers
        if ($validated['type'] === 'true_false' && count($validated['answers']) !== 2) {
            return back()->withErrors(['answers' => 'True/False questions must have exactly 2 answers.']);
        }

        // Update question
        $question->update([
            'question' => $validated['question'],
            'type' => $validated['type'],
            'points' => $validated['points'],
        ]);

        // Get existing answer IDs
        $existingAnswerIds = $question->answers->pluck('id')->toArray();
        $updatedAnswerIds = [];

        // Update or create answers
        foreach ($validated['answers'] as $answerData) {
            if (isset($answerData['id'])) {
                Answer::where('id', $answerData['id'])->update([
                    'answer' => $answerData['answer'],
                    'is_correct' => $answerData['is_correct'],
                ]);
                $updatedAnswerIds[] = $answerData['id'];
            } else {
                $answer = Answer::create([
                    'question_id' => $question->id,
                    'answer' => $answerData['answer'],
                    'is_correct' => $answerData['is_correct'],
                ]);
                $updatedAnswerIds[] = $answer->id;
            }
        }

        // Delete answers that weren't updated
        $answersToDelete = array_diff($existingAnswerIds, $updatedAnswerIds);
        if (!empty($answersToDelete)) {
            Answer::whereIn('id', $answersToDelete)->delete();
        }

        return redirect()->route('instructor.lessons.quizzes.show', [$quiz->lesson_id, $quiz->id])
            ->with('success', 'Question updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Quiz $quiz, Question $question)
    {
        $this->authorize('delete', $quiz->lesson);

        if ($question->quiz_id !== $quiz->id) {
            abort(404);
        }

        $question->delete();

        return back()->with('success', 'Question deleted successfully.');
    }
}
