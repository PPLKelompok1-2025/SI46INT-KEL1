<?php

namespace App\Policies;

use App\Models\Quiz;
use App\Models\User;
use App\Models\Lesson;
use Illuminate\Auth\Access\HandlesAuthorization;

class QuizPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     * Instructors can view quizzes of lessons they own.
     */
    public function viewAny(User $user, Lesson $lesson): bool
    {
        return $user->isInstructor() && $user->id === $lesson->course->user_id;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Quiz $quiz): bool
    {
        if ($user->isInstructor() && $user->id === $quiz->lesson->course->user_id) {
            return true;
        }

        if ($user->isStudent() && $quiz->lesson->course->enrollments()->where('user_id', $user->id)->exists()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     * The $lesson context is needed to ensure the user owns the lesson.
     */
    public function create(User $user, Lesson $lesson): bool
    {
        return $user->isInstructor() && $user->id === $lesson->course->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Quiz $quiz): bool
    {
        return $user->isInstructor() && $user->id === $quiz->lesson->course->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Quiz $quiz): bool
    {
        return $user->isInstructor() && $user->id === $quiz->lesson->course->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Quiz $quiz): bool
    {
        return $user->isInstructor() && $user->id === $quiz->lesson->course->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Quiz $quiz): bool
    {
        return $user->isInstructor() && $user->id === $quiz->lesson->course->user_id;
    }

    /**
     * Determine whether a student can submit a quiz attempt.
     */
    public function submit(User $user, Quiz $quiz): bool
    {
        if (!$user->isStudent()) {
            return false;
        }

        $isEnrolled = $quiz->lesson->course->enrollments()->where('user_id', $user->id)->exists();
        if (!$isEnrolled) {
            return false;
        }

        if ($quiz->due_date && now()->gt($quiz->due_date)) {
            $lastAttempt = $quiz->attempts()->where('user_id', $user->id)->latest()->first();
            if (!$lastAttempt || $lastAttempt->passed) {
                 return false;
            }
        }

        $hasPassed = $quiz->attempts()->where('user_id', $user->id)->where('passed', true)->exists();
        if ($hasPassed) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether an instructor can generate a quiz using AI.
     * The $lesson context is needed to ensure the user owns the lesson.
     */
    public function generate(User $user, Lesson $lesson): bool
    {
        return $user->isInstructor() && $user->id === $lesson->course->user_id;
    }
}
