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
use Illuminate\Support\Facades\Gate;

class LessonController extends Controller
{
    /**
     * Display a listing of the lessons for a course.
     *
     * @param  \App\Models\Course  $course
     * @return \Inertia\Response
     */
    public function index(Request $request, Course $course)
    {
        Gate::authorize('update', $course);

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
    public function create(Request $request, Course $course)
    {
        Gate::authorize('update', $course);

        $maxOrder = $course->lessons()->max('order') ?? 0;

        return Inertia::render('Instructor/Lessons/Create', [
            'course' => $course,
            'nextOrder' => $maxOrder + 1,
            'activeTab' => $request->input('activeTab', 'basic')
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
        Gate::authorize('update', $course);

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
            $videoPath = $this->processVideo($tempPath, $validated['slug']);
            if ($videoPath) {
                $validated['video_path'] = $videoPath;
                $validated['video_disk'] = 'encrypted_videos';
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
    public function show(Request $request, Course $course, Lesson $lesson)
    {
        Gate::authorize('view', $lesson);
        if ($lesson->course_id !== $course->id) {
            abort(404);
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
    public function edit(Request $request, Course $course, Lesson $lesson)
    {
        Gate::authorize('update', $lesson);
        if ($lesson->course_id !== $course->id) {
            abort(404);
        }

        return Inertia::render('Instructor/Lessons/Edit', [
            'lesson' => $lesson,
            'course' => $course,
            'activeTab' => $request->input('activeTab', 'basic')
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
        Gate::authorize('update', $lesson);
        if ($lesson->course_id !== $course->id) {
            abort(404);
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
            $videoPath = $this->processVideo($tempPath, $validated['slug']);
            if ($videoPath) {
                $validated['video_path'] = $videoPath;
                $validated['video_disk'] = 'encrypted_videos';
                $validated['video_url'] = null;
            }
            unset($validated['temp_video']);
        } elseif (array_key_exists('video_url', $validated) && !empty($validated['video_url'])){
            if ($lesson->video_path) {
                $this->deleteVideo($lesson->video_path, $lesson->video_disk);
                $validated['video_path'] = null;
                $validated['video_disk'] = null;
            }
        }

        $lesson->update($validated);

        return redirect()->route('instructor.courses.lessons.show', [$course->id, $lesson->id])
            ->with('success', 'Lesson updated successfully');
    }

    /**
     * Remove the specified lesson from storage.
     *
     * @param  \App\Models\Course  $course
     * @param  \App\Models\Lesson  $lesson
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Request $request, Course $course, Lesson $lesson)
    {
        Gate::authorize('delete', $lesson);
        if ($lesson->course_id !== $course->id) {
            abort(404);
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
        Gate::authorize('update', $course);

        $request->validate([
            'lessons' => 'required|array',
            'lessons.*.id' => 'required|exists:lessons,id',
            'lessons.*.order' => 'required|integer|min:1',
        ]);

        foreach ($request->lessons as $lessonData) {
            $lesson = Lesson::find($lessonData['id']);
            if ($lesson && $lesson->course_id === $course->id) {
                $lesson->update(['order' => $lessonData['order']]);
            }
        }

        return response()->json(['message' => 'Lessons reordered successfully.']);
    }

    /**
     * Handle temporary video upload
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadTemporaryVideo(Request $request)
    {
        if (!$request->user() || !$request->user()->isInstructor()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'video' => 'required|file|mimetypes:video/mp4,video/mpeg,video/quicktime,video/webm,video/x-msvideo,video/x-flv|max:1024000',
        ]);

        $path = $request->file('video')->store('temp_videos', 'local');

        return response()->json(['path' => $path]);
    }

    /**
     * Delete temporary video
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteTemporaryVideo(Request $request)
    {
        if (!$request->user() || !$request->user()->isInstructor()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->input('path');

        if (Str::startsWith($path, 'temp_videos/') && Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
            return response()->json(['message' => 'Temporary video deleted.']);
        }

        return response()->json(['error' => 'Invalid path or file not found.'], 400);
    }

    /**
     * Process the video with HLS and encryption
     *
     * @param  string  $tempPath
     * @param  string  $slug
     * @return string|null The path to the processed video directory
     */
    private function processVideo($tempPath, $slug)
    {
        $disk = 'encrypted_videos';
        $filenameBase = "lessons/{$slug}/" . Str::random(40);
        $hlsPlaylist = $filenameBase . '.m3u8';

        try {
            Storage::disk($disk)->makeDirectory("lessons/{$slug}");

            $lowBitrate = (new X264('aac'))->setKiloBitrate(250);
            $midBitrate = (new X264('aac'))->setKiloBitrate(500);
            $highBitrate = (new X264('aac'))->setKiloBitrate(1000);

            Log::info("Starting HLS export for: {$tempPath} to {$hlsPlaylist}");

            FFMpeg::fromDisk('local')
                ->open($tempPath)
                ->exportForHLS()
                ->withEncryptionKey(Str::random(32))
                ->setSegmentLength(10)
                ->setKeyFrameInterval(48)
                ->addFormat($lowBitrate, function($media) {
                    $media->scale(640, 360);
                })
                ->addFormat($midBitrate, function($media) {
                    $media->scale(854, 480);
                })
                ->addFormat($highBitrate, function($media) {
                    $media->scale(1280, 720);
                })
                ->toDisk($disk)
                ->save($hlsPlaylist);

            Log::info("HLS export successful for: {$hlsPlaylist}");

            Storage::disk('local')->delete($tempPath);

            return $hlsPlaylist;
        } catch (\ProtoneMedia\LaravelFFMpeg\Exporters\EncodingException $exception) {
            Log::error("FFMpeg Encoding failed for {$tempPath}: " . $exception->getCommand() . "\nError output: " . $exception->getErrorOutput());
        } catch (\Exception $e) {
            Log::error("Video processing error for {$tempPath}: " . $e->getMessage());
        }
        if (Storage::disk('local')->exists($tempPath)) {
             Storage::disk('local')->delete($tempPath);
        }
        return null;
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
            if ($path && Storage::disk($disk)->exists($path)) {
                $directory = dirname($path);
                Storage::disk($disk)->deleteDirectory($directory);
                Log::info("Deleted video directory: {$directory} on disk {$disk}");
                return true;
            }
        } catch (\Exception $e) {
            Log::error("Error deleting video directory: {$path} on disk {$disk}. Error: " . $e->getMessage());
        }
        return false;
    }

    /**
     * Stream the video (handles encryption/decryption)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Lesson  $lesson
     * @param  string|null  $file
     * @return \Symfony\Component\HttpFoundation\StreamedResponse|\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function streamVideo(Request $request, Lesson $lesson, $file = null)
    {
        Gate::authorize('view', $lesson);

        $diskName = $lesson->video_disk ?: 'encrypted_videos';
        $basePath = dirname($lesson->video_path);

        if (!$lesson->video_path || !Storage::disk($diskName)->exists($lesson->video_path)) {
            Log::error("Video path not found or invalid for lesson {$lesson->id}: {$lesson->video_path}");
            abort(404, 'Video not found.');
        }

        if ($request->query('playlist') === 'true' && $file === null) {
            $masterPlaylistPath = $lesson->video_path;
            if (Storage::disk($diskName)->exists($masterPlaylistPath)) {
                $content = Storage::disk($diskName)->get($masterPlaylistPath);
                return Response::make($content, 200, [
                    'Content-Type' => 'application/vnd.apple.mpegurl',
                    'Content-Disposition' => 'inline; filename="playlist.m3u8"',
                ]);
            }
        } elseif (Str::endsWith($file, '.m3u8')) {
            $mediaPlaylistPath = $basePath . '/' . $file;
            if (Storage::disk($diskName)->exists($mediaPlaylistPath)) {
                $content = Storage::disk($diskName)->get($mediaPlaylistPath);
                return Response::make($content, 200, [
                    'Content-Type' => 'application/vnd.apple.mpegurl',
                    'Content-Disposition' => 'inline; filename="' . $file . '"',
                ]);
            }
        } elseif (Str::endsWith($file, '.key')) {
            $keyPath = $basePath . '/' . $file;
            if (Storage::disk($diskName)->exists($keyPath)) {
                $content = Storage::disk($diskName)->get($keyPath);
                return Response::make($content, 200, [
                    'Content-Type' => 'binary/octet-stream',
                ]);
            }
        } elseif (Str::endsWith($file, '.ts')) {
            $segmentPath = $basePath . '/' . $file;
            if (Storage::disk($diskName)->exists($segmentPath)) {
                $content = Storage::disk($diskName)->get($segmentPath);
                return Response::make($content, 200, [
                    'Content-Type' => 'video/mp2t',
                    'Content-Disposition' => 'inline; filename="' . basename($segmentPath) . '"',
                ]);
            }
        }

        Log::warning("StreamVideo: Requested file not found or type not handled.", ['lesson_id' => $lesson->id, 'file' => $file, 'base_path' => $basePath]);
        abort(404, 'File not found or invalid request.');
    }
}
