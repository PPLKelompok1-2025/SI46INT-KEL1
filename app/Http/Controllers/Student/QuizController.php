<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Question;
use App\Models\Lesson;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class QuizController extends Controller
{
    /**
     * Display the specified quiz for a student to take.
     */
    public function show(Request $request, Quiz $quiz)
    {
        Gate::authorize('view', $quiz);

        $lesson = $quiz->lesson;
        $course = $lesson->course;

        $isDuePassed = $quiz->due_date && now()->gt($quiz->due_date);

        $attempts = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $canTakeQuiz = true;
        $lastAttempt = $attempts->first();

        if ($lastAttempt && $lastAttempt->passed) {
            $canTakeQuiz = false;
        }

        if ($isDuePassed) {
            if (!$lastAttempt || $lastAttempt->passed) {
                 $canTakeQuiz = false;
            }
        }

        if (!Gate::allows('submit', $quiz)) {
            $canTakeQuiz = false;
        }

        // Always load questions and associated answers for display (count and later questions)
            $quiz->load(['questions' => function($query) {
                $query->with(['answers' => function($query) {
                    $query->select('id', 'question_id', 'answer');
                }]);
            }]);

        return Inertia::render('Student/Quizzes/Show', [
            'quiz' => $quiz,
            'lesson' => $lesson,
            'course' => $course,
            'attempts' => $attempts,
            'canTakeQuiz' => $canTakeQuiz,
            'isDuePassed' => $isDuePassed
        ]);
    }

    /**
     * Submit a quiz attempt.
     */
    public function submit(Request $request, Quiz $quiz)
    {
        Gate::authorize('submit', $quiz);

        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*' => 'required|array',
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.selected_answers' => 'required|array',
            'answers.*.selected_answers.*' => 'required|exists:answers,id',
        ]);

        $totalPoints = 0;
        $earnedPoints = 0;
        $answerDetails = [];

        foreach ($validated['answers'] as $answerData) {
            $question = Question::with('answers')->find($answerData['question_id']);

            if (!$question || $question->quiz_id !== $quiz->id) {
                return back()->with('error', 'Invalid question submission.');
            }

            $totalPoints += $question->points;
            $isCorrect = false;

            $correctAnswerIds = $question->answers()
                ->where('is_correct', true)
                ->pluck('id')
                ->toArray();

            $selectedAnswerIds = $answerData['selected_answers'];
            sort($correctAnswerIds);
            sort($selectedAnswerIds);

            if ($correctAnswerIds == $selectedAnswerIds) {
                $earnedPoints += $question->points;
                $isCorrect = true;
            }

            $answerDetails[] = [
                'question_id' => $question->id,
                'selected_answers' => $selectedAnswerIds,
                'correct_answers' => $correctAnswerIds,
                'is_correct' => $isCorrect
            ];
        }

        $scorePercentage = $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100) : 0;
        $passed = $scorePercentage >= $quiz->passing_score;

        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => $request->user()->id,
            'score' => $scorePercentage,
            'passed' => $passed,
            'completed_at' => now(),
            'answers' => $answerDetails
        ]);

        return redirect()->route('student.quizzes.results', $attempt->id)
            ->with('success', 'Quiz submitted successfully.');
    }

    /**
     * Show the results of a quiz attempt.
     */
    public function results(Request $request, $attemptId)
    {
        $attempt = QuizAttempt::with('quiz.lesson.course')->findOrFail($attemptId);

        if ($attempt->user_id !== $request->user()->id) {
            abort(403, 'You do not have access to this quiz attempt.');
        }

        $quiz = $attempt->quiz;
        $lesson = $quiz->lesson;
        $course = $lesson->course;

        $questions = Question::with('answers')
            ->where('quiz_id', $quiz->id)
            ->get();

        return Inertia::render('Student/Quizzes/Results', [
            'attempt' => $attempt,
            'quiz' => $quiz,
            'lesson' => $lesson,
            'course' => $course,
            'questions' => $questions
        ]);
    }
}
