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
use FFMpeg\Format\Video\X264;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;

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
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to add lessons to this course');
        }

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
            'temp_video' => 'nullable|string',
            'duration' => 'nullable|integer|min:0',
            'order' => 'required|integer|min:1',
            'is_free' => 'boolean',
            'is_published' => 'boolean',
            'section' => 'nullable|string|max:255',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $validated['course_id'] = $course->id;

        if (!empty($validated['temp_video'])) {
            $tempPath = $validated['temp_video'];

            $encryptionKey = Str::random(32);

            $videoPath = $this->processVideo($tempPath, $validated['slug'], $encryptionKey);

            if ($videoPath) {
                $validated['video_path'] = $videoPath;
                $validated['video_disk'] = 'encrypted_videos';
                $validated['encryption_key'] = $encryptionKey;
            }

            unset($validated['temp_video']);
        }

        $lesson = Lesson::create($validated);

        return redirect()->route('instructor.courses.lessons.index', $course->id)
            ->with('success', 'Lesson created successfully');
    }

    /**
     * Display the specified lesson.
     *
     * @param  \App\Models\Course  $course
     * @param  \App\Models\Lesson  $lesson
     * @return \Inertia\Response
     */
    public function show(Course $course, Lesson $lesson)
    {
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
     * @param  \App\Models\Course  $course
     * @param  \App\Models\Lesson  $lesson
     * @return \Inertia\Response
     */
    public function edit(Course $course, Lesson $lesson)
    {
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
     * @param  \App\Models\Course  $course
     * @param  \App\Models\Lesson  $lesson
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Course $course, Lesson $lesson)
    {
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
            'temp_video' => 'nullable|string',
            'duration' => 'nullable|integer|min:0',
            'order' => 'required|integer|min:1',
            'is_free' => 'boolean',
            'is_published' => 'boolean',
            'section' => 'nullable|string|max:255',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        if (!empty($validated['temp_video'])) {
            if ($lesson->video_path) {
                $this->deleteVideo($lesson->video_path, $lesson->video_disk);
            }

            $tempPath = $validated['temp_video'];

            $encryptionKey = Str::random(32);

            $videoPath = $this->processVideo($tempPath, $validated['slug'], $encryptionKey);

            if ($videoPath) {
                $validated['video_path'] = $videoPath;
                $validated['video_disk'] = 'encrypted_videos';
                $validated['encryption_key'] = $encryptionKey;
                $validated['video_url'] = null;
            }

            unset($validated['temp_video']);
        }

        $lesson->update($validated);

        return redirect()->route('instructor.courses.lessons.index', $course->id)
            ->with('success', 'Lesson updated successfully');
    }

    /**
     * Remove the specified lesson from storage.
     *
     * @param  \App\Models\Course  $course
     * @param  \App\Models\Lesson  $lesson
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Course $course, Lesson $lesson)
    {
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.courses.index')
                ->with('error', 'You do not have permission to delete this lesson');
        }

        if ($lesson->video_path) {
            $this->deleteVideo($lesson->video_path, $lesson->video_disk);
        }

        $lesson->delete();

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

            if ($lesson->course_id === $course->id) {
                $lesson->update(['order' => $lessonData['order']]);
            }
        }

        return redirect()->route('instructor.courses.lessons.index', $course->id)
            ->with('success', 'Lessons reordered successfully');
    }

    /**
     * Handle temporary video upload
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadTemporaryVideo(Request $request)
    {
        $request->validate([
            'video' => 'required|file|mimetypes:video/mp4,video/avi,video/mpeg,video/quicktime|max:102400', // 100MB max
        ]);

        $file = $request->file('video');
        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('temp\\videos', $fileName, 'local');

        return response()->json([
            'path' => $path
        ]);
    }

    /**
     * Delete temporary video
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteTemporaryVideo(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->input('path');

        if (!Str::startsWith($path, 'temp/videos/')) {
            return response()->json(['error' => 'Invalid path'], 400);
        }

        if (Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
            return response()->json(['success' => true]);
        }

        return response()->json(['error' => 'File not found'], 404);
    }

    /**
     * Process the video with HLS and encryption
     *
     * @param  string  $tempPath
     * @param  string  $slug
     * @param  string  $encryptionKey
     * @return string|null The path to the processed video directory
     */
    private function processVideo($tempPath, $slug, $encryptionKey)
    {
        try {
            $videoDirectory = 'videos\\' . Str::slug($slug) . '_' . Str::random(8);
            Storage::disk('encrypted_videos')->makeDirectory($videoDirectory);

            $keyPath = 'keys/' . Str::slug($slug) . '_' . Str::random(8) . '.key';
            Storage::disk('private')->put($keyPath, $encryptionKey);

            $fullTempPath = Storage::disk('local')->path($tempPath);
            // $duration = FFMpeg::open($fullTempPath)->getDurationInSeconds();

            $lowBitrate = (new X264)->setKiloBitrate(500);
            $midBitrate = (new X264)->setKiloBitrate(1000);
            $highBitrate = (new X264)->setKiloBitrate(1500);

            FFMpeg::fromDisk('local')
                ->open($tempPath)
                ->exportForHLS()
                ->withEncryptionKey(Storage::disk('private')->path($keyPath))
                ->addFormat($lowBitrate, function($filters) {
                    $filters->resize(640, 360);
                })
                ->addFormat($midBitrate, function($filters) {
                    $filters->resize(1280, 720);
                })
                ->addFormat($highBitrate, function($filters) {
                    $filters->resize(1920, 1080);
                })
                ->toDisk('encrypted_videos')
                ->save($videoDirectory . '/playlist.m3u8');

            Storage::disk('local')->delete($tempPath);

            return $videoDirectory . '/playlist.m3u8';
        } catch (\Exception $e) {
            Log::error('Video processing error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete a video and its associated files
     *
     * @param  string  $path
     * @param  string  $disk
     * @return void
     */
    private function deleteVideo($path, $disk)
    {
        try {
            $directory = dirname($path);
            Storage::disk($disk)->deleteDirectory($directory);
        } catch (\Exception $e) {
            Log::error('Video deletion error: ' . $e->getMessage());
        }
    }

    /**
     * Stream the video (handles encryption/decryption)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Lesson  $lesson
     * @return \Symfony\Component\HttpFoundation\StreamedResponse|\Illuminate\Http\Response
     */
    public function streamVideo(Request $request, Lesson $lesson)
    {
        $course = $lesson->course;
        $user = Auth::user();

        if ($course->user_id !== $user->id) {
            $isEnrolled = $course->enrollments()
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->exists();

            if (!$isEnrolled && !$lesson->is_free) {
                return Response::json(['error' => 'Unauthorized access. You must be enrolled in this course to access this video.'], 403);
            }
        }

        if (!$lesson->hasEncryptedVideo()) {
            return Response::json(['error' => 'No video available'], 404);
        }

        if ($request->has('playlist')) {
            $path = Storage::disk($lesson->video_disk)->path($lesson->video_path);
            return Response::file($path);
        }

        if ($request->has('segment')) {
            $segmentPath = dirname($lesson->video_path) . '/' . $request->segment;
            $path = Storage::disk($lesson->video_disk)->path($segmentPath);
            return Response::file($path);
        }

        if ($request->has('key')) {
            if (!$lesson->encryption_key) {
                return Response::json(['error' => 'No encryption key available'], 404);
            }

            return Response::make($lesson->encryption_key)
                ->header('Content-Type', 'application/octet-stream');
        }

        return Response::json(['error' => 'Invalid request'], 400);
    }
}
