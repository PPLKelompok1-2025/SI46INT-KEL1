<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Answer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class QuizController extends Controller
{
    /**
     * Display a listing of quizzes for a specific lesson.
     */
    public function index(Lesson $lesson, Request $request)
    {
        $quizzes = Quiz::where('lesson_id', $lesson->id)
            ->withCount('questions')
            ->get();

        $course = $lesson->course;

        return Inertia::render('Instructor/Quizzes/Index', [
            'lesson' => $lesson,
            'course' => $course,
            'quizzes' => $quizzes,
        ]);
    }

    /**
     * Show the form for creating a new quiz.
     */
    public function create(Lesson $lesson, Request $request)
    {
        $request->user()->can('create', [Quiz::class, $lesson]);

        $course = $lesson->course;

        return Inertia::render('Instructor/Quizzes/Create', [
            'lesson' => $lesson,
            'course' => $course
        ]);
    }

    /**
     * Store a newly created quiz in storage.
     */
    public function store(Request $request, Lesson $lesson)
    {
        Gate::authorize('create', [Quiz::class, $lesson]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_limit' => 'nullable|integer|min:1',
            'passing_score' => 'required|integer|min:1|max:100',
            'due_date' => 'nullable|date',
        ]);

        $quiz = Quiz::create([
            'lesson_id' => $lesson->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'time_limit' => $validated['time_limit'],
            'passing_score' => $validated['passing_score'],
            'due_date' => $validated['due_date'] ?? null,
        ]);

        return redirect()->route('instructor.quizzes.questions.create', $quiz->id)
            ->with('success', 'Quiz created successfully. Now add some questions.');
    }

    /**
     * Display the specified quiz.
     */
    public function show(Lesson $lesson, Quiz $quiz, Request $request)
    {
        $request->user()->can('view', $quiz);

        $quiz->load(['questions' => function($query) {
            $query->with('answers');
        }]);

        $course = $quiz->lesson->course;

        // Get statistics
        $totalAttempts = $quiz->attempts()->count();
        $passedAttempts = $quiz->attempts()->where('passed', true)->count();
        $passRate = $totalAttempts > 0 ? round(($passedAttempts / $totalAttempts) * 100) : 0;

        $averageScore = $quiz->attempts()->avg('score') ?? 0;

        return Inertia::render('Instructor/Quizzes/Show', [
            'quiz' => $quiz,
            'lesson' => $lesson,
            'course' => $course,
            'stats' => [
                'totalAttempts' => $totalAttempts,
                'passedAttempts' => $passedAttempts,
                'passRate' => $passRate,
                'averageScore' => $averageScore,
            ]
        ]);
    }

    /**
     * Show the form for editing the specified quiz.
     */
    public function edit(Lesson $lesson, Quiz $quiz, Request $request)
    {
        $request->user()->can('update', $quiz);

        $course = $quiz->lesson->course;

        return Inertia::render('Instructor/Quizzes/Edit', [
            'quiz' => $quiz,
            'lesson' => $lesson,
            'course' => $course
        ]);
    }

    /**
     * Update the specified quiz in storage.
     */
    public function update(Request $request, Lesson $lesson, Quiz $quiz)
    {
        Gate::authorize('update', $quiz);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_limit' => 'nullable|integer|min:1',
            'passing_score' => 'required|integer|min:1|max:100',
            'due_date' => 'nullable|date',
        ]);

        $quiz->update($validated);

        return redirect()->route('instructor.lessons.quizzes.show', [$lesson->id, $quiz->id])
            ->with('success', 'Quiz updated successfully.');
    }

    /**
     * Remove the specified quiz from storage.
     */
    public function destroy(Lesson $lesson, Quiz $quiz, Request $request)
    {
        Gate::authorize('delete', $quiz);

        $quiz->delete();

        return redirect()->route('instructor.lessons.quizzes.index', $lesson->id)
            ->with('success', 'Quiz deleted successfully.');
    }

    /**
     * Generate a quiz using Gemini AI based on uploaded document
     */
    public function generateQuiz(Request $request, Lesson $lesson)
    {
        Gate::authorize('generate', [Quiz::class, $lesson]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_limit' => 'nullable|integer|min:1',
            'passing_score' => 'required|integer|min:1|max:100',
            'due_date' => 'nullable|date',
            'document' => 'required|file|mimes:pdf,docx,doc|max:10240',
            'num_questions' => 'required|integer|min:5|max:30',
            'question_types' => 'required|array',
            'question_types.*' => 'required|in:multiple_choice,true_false',
        ]);

        try {
            // Store document temporarily
            $documentPath = $request->file('document')->store('temp');
            $documentContent = $this->extractTextFromDocument($documentPath);

            if (empty($documentContent)) {
                Storage::delete($documentPath);
                return back()->withErrors(['document' => 'Could not extract text from the document. Please try another file.'])->withInput();
            }

            // Generate questions using Gemini API
            $questions = $this->generateQuestionsWithGemini(
                $documentContent,
                $validated['num_questions'],
                $validated['question_types']
            );

            if (empty($questions)) {
                Storage::delete($documentPath);
                return back()->withErrors(['document' => 'Failed to generate questions. Please try again or create questions manually.'])->withInput();
            }

            // Create the quiz
            $quiz = Quiz::create([
                'lesson_id' => $lesson->id,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'time_limit' => $validated['time_limit'],
                'passing_score' => $validated['passing_score'],
                'due_date' => $validated['due_date'] ?? null,
            ]);

            // Create questions and answers
            foreach ($questions as $questionData) {
                $question = Question::create([
                    'quiz_id' => $quiz->id,
                    'question' => $questionData['question'],
                    'type' => $questionData['type'],
                    'points' => 1,
                ]);

                foreach ($questionData['answers'] as $answerData) {
                    Answer::create([
                        'question_id' => $question->id,
                        'answer' => $answerData['text'],
                        'is_correct' => $answerData['is_correct'],
                    ]);
                }
            }

            // Clean up
            Storage::delete($documentPath);

            return redirect()->route('instructor.lessons.quizzes.show', [$lesson->id, $quiz->id])
                ->with('success', 'Quiz generated successfully with ' . count($questions) . ' questions.');

        } catch (\Exception $e) {
            Log::error('Quiz generation error: ' . $e->getMessage());
            if (isset($documentPath) && Storage::exists($documentPath)) {
                Storage::delete($documentPath);
            }
            return back()->withErrors(['document' => 'An error occurred while generating the quiz. Please try again. Error: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Extract text content from uploaded document (PDF or DOCX)
     *
     * Note: This requires the smalot/pdfparser and phpoffice/phpword packages to be installed.
     */
    private function extractTextFromDocument($path)
    {
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $content = '';

        try {
            if ($extension === 'pdf') {
                // Requires composer require smalot/pdfparser
                $parser = new \Smalot\PdfParser\Parser();
                $pdf = $parser->parseFile(Storage::path($path));
                $content = $pdf->getText();
            } elseif (in_array($extension, ['docx', 'doc'])) {
                // Requires composer require phpoffice/phpword
                // Determine the reader type based on the extension
                $readerType = null;
                if ($extension === 'docx') {
                    $readerType = 'Word2007';
                } elseif ($extension === 'doc') {
                    // For .doc files, try MsDoc reader first, then ODT if needed (though ODT is not .doc)
                    // PHPWord might not perfectly support all .doc variations.
                    $readerType = 'MsDoc';
                }

                if ($readerType) {
                    $reader = \PhpOffice\PhpWord\IOFactory::createReader($readerType);
                    if ($reader->canRead(Storage::path($path))) {
                $phpWord = $reader->load(Storage::path($path));
                foreach ($phpWord->getSections() as $section) {
                    foreach ($section->getElements() as $element) {
                        if (method_exists($element, 'getText')) {
                            $content .= $element->getText() . ' ';
                        }
                    }
                }
                    } else {
                        Log::warning("PHPWord: Cannot read document with {$readerType} reader.", ['path' => $path]);
                    }
                } else {
                    Log::warning('Unsupported document extension for text extraction.', ['extension' => $extension]);
                }
            }

            return trim($content);
        } catch (\Exception $e) {
            Log::error('Document extraction error: ' . $e->getMessage(), ['path' => $path, 'exception' => $e]);
            return '';
        }
    }

    /**
     * Generate questions using Gemini AI
     */
    private function generateQuestionsWithGemini(string $content, int $numQuestions, array $questionTypes): array
    {
        $apiKey = config('services.gemini.key') ?? env('GEMINI_API_KEY');
        if (!$apiKey) {
            Log::error('Gemini API key is not configured.');
            return [];
        }
        // Determine model name from config or default
        $model = config('services.gemini.model', 'gemini-1.5-flash');
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        // Build the instruction prompt
        $prompt = "Generate {$numQuestions} quiz questions based on the following content. ";
        $prompt .= "For each question: ";
        $prompt .= "1. Determine if it's 'multiple_choice' or 'true_false' based on the requested types: " . implode(', ', $questionTypes) . ". ";
        $prompt .= "2. If 'multiple_choice', provide exactly 4 answer options: one correct answer and three plausible but incorrect distractors. Randomize the position of the correct answer. ";
        $prompt .= "3. If 'true_false', provide exactly two answer options: one 'True' and one 'False'. One must be marked as correct and the other incorrect. ";
        $prompt .= "4. Return a pure JSON array of objects. Each object must have these keys: 'question' (string), 'type' (string: 'multiple_choice' or 'true_false'), and 'answers' (array of objects). ";
        $prompt .= "5. Each object in the 'answers' array must have 'text' (string) and 'is_correct' (boolean). For 'multiple_choice', only one answer object should have 'is_correct: true'. For 'true_false', one answer will be 'is_correct: true' and the other 'is_correct: false'. ";
        $prompt .= "Ensure the JSON is well-formed and contains only the array of questions. ";
        $prompt .= "Content:\n\n" . substr(strip_tags($content), 0, 18000);
        // Sanitize prompt to valid UTF-8 to avoid JSON encoding errors
        $prompt = mb_convert_encoding($prompt, 'UTF-8', 'UTF-8');

        // Send request to Gemini
        $response = Http::timeout(120)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($url, [
                'contents' => [ ['parts' => [['text' => $prompt]]] ],
                'generationConfig' => [
                    'temperature' => 0.3,
                    'topP' => 0.8,
                    'topK' => 40,
                    'responseMimeType' => 'application/json',
                    'candidateCount' => 1,
                ],
            ]);

        if (!$response->successful()) {
            Log::error('Gemini API request failed', ['status' => $response->status(), 'body' => $response->body()]);
            return [];
        }

        $raw = $response->json('candidates.0.content.parts.0.text');
        if (empty($raw)) {
            Log::error('Gemini API unexpected response', ['response' => $response->json()]);
            return [];
        }

        // Clean up wrapping markdown or prefixes
        $clean = trim($raw, " \t\n\r\0\x0B`");
        if (strtolower(substr($clean, 0, 4)) === 'json') {
            $clean = trim(substr($clean, 4), " \t\n\r\0\x0B`");
        }

        $questions = json_decode($clean, true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($questions)) {
            Log::error('Failed to decode Gemini JSON', ['error' => json_last_error_msg(), 'payload' => $clean]);
            return [];
        }
        return $questions;
    }
}
