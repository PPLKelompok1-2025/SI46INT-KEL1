<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonCompletion;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Jobs\GenerateCertificatePdf;

class EnrollmentController extends Controller
{
    /**
     * Enroll the authenticated user in a course.
     *
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\RedirectResponse
     */
    public function enroll(Course $course)
    {
        $user = Auth::user();

        // Check if user is already enrolled
        $existingEnrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existingEnrollment) {
            return redirect()->route('student.courses.show', $course->slug)
                ->with('info', 'You are already enrolled in this course.');
        }

        // Create enrollment
        Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'enrolled_at' => now(),
            'progress' => 0.00,
        ]);

        return redirect()->route('student.courses.show', $course->slug)
            ->with('success', 'Successfully enrolled in this course.');
    }

    /**
     * Mark a lesson as completed.
     *
     * @param  \App\Models\Lesson  $lesson
     * @return \Illuminate\Http\RedirectResponse
     */
    public function completeLesson(Lesson $lesson)
    {
        $user = Auth::user();

        // Get the enrollment for this course
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $lesson->course_id)
            ->first();

        if (!$enrollment) {
            return redirect()->back()
                ->with('error', 'You must be enrolled in this course to mark lessons as completed.');
        }

        // Check if lesson is already completed
        $lessonCompletion = LessonCompletion::where('enrollment_id', $enrollment->id)
            ->where('lesson_id', $lesson->id)
            ->first();

        if (!$lessonCompletion) {
            // Mark the lesson as completed
            LessonCompletion::create([
                'enrollment_id' => $enrollment->id,
                'lesson_id' => $lesson->id,
            ]);

            // Update the enrollment progress
            $this->updateEnrollmentProgress($enrollment);
        }

        return redirect()->back()
            ->with('success', 'Lesson marked as completed.');
    }

    /**
     * Mark a course as completed.
     *
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\RedirectResponse
     */
    public function complete(Course $course)
    {
        $user = Auth::user();

        // Get the enrollment for this course
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return redirect()->back()
                ->with('error', 'You must be enrolled in this course to complete it.');
        }

        // Calculate the progress to see if all lessons are completed
        $completedLessonsCount = $enrollment->completedLessons()->count();
        $totalLessonsCount = $course->lessons()->count();

        if ($totalLessonsCount === 0 || $completedLessonsCount < $totalLessonsCount) {
            return redirect()->back()
                ->with('error', 'You must complete all lessons before completing the course.');
        }

        // Begin transaction
        DB::beginTransaction();

        try {
            // Mark the enrollment as completed
            $enrollment->markAsCompleted();

            // Generate certificate if one doesn't already exist
            $existingCertificate = Certificate::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            if (!$existingCertificate) {
                $certificate = Certificate::create([
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                    'certificate_number' => 'CERT-' . Str::upper(Str::random(8)) . '-' . $user->id . '-' . $course->id,
                    'issued_at' => now(),
                ]);

                // In a real implementation, you might want to queue a job to generate the PDF
                GenerateCertificatePdf::dispatch($certificate);
            }

            DB::commit();

            return redirect()->route('student.certificates.index')
                ->with('success', 'Congratulations! Course completed successfully. You can now view your certificate.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'An error occurred while completing the course. Please try again.');
        }
    }

    /**
     * Update the progress of an enrollment based on completed lessons.
     *
     * @param  \App\Models\Enrollment  $enrollment
     * @return void
     */
    private function updateEnrollmentProgress(Enrollment $enrollment)
    {
        $course = $enrollment->course;
        $totalLessons = $course->lessons()->count();

        if ($totalLessons === 0) {
            $enrollment->updateProgress(100);
            return;
        }

        $completedLessons = $enrollment->completedLessons()->count();
        $progress = round(($completedLessons / $totalLessons) * 100);

        $enrollment->updateProgress($progress);

        // If all lessons are completed, mark the course as completed and generate certificate
        if ($completedLessons >= $totalLessons) {
            $this->autoCompleteCourse($enrollment);
        }
    }

    /**
     * Automatically complete a course when all lessons are completed.
     *
     * @param  \App\Models\Enrollment  $enrollment
     * @return void
     */
    private function autoCompleteCourse(Enrollment $enrollment)
    {
        $user = Auth::user();
        $course = $enrollment->course;

        // Begin transaction
        DB::beginTransaction();

        try {
            // Mark the enrollment as completed
            $enrollment->markAsCompleted();

            // Generate certificate if one doesn't already exist
            $existingCertificate = Certificate::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            if (!$existingCertificate) {
                $certificate = Certificate::create([
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                    'certificate_number' => 'CERT-' . Str::upper(Str::random(8)) . '-' . $user->id . '-' . $course->id,
                    'issued_at' => now(),
                ]);

                // In a real implementation, you might want to queue a job to generate the PDF
                GenerateCertificatePdf::dispatch($certificate);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            // Log the error but don't interrupt the user flow
            Log::error('Error auto-completing course: ' . $e->getMessage());
        }
    }
}
