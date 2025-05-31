<?php

namespace App\Policies;

use App\Models\Lesson;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class LessonPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user, Lesson $lesson): bool
    {
        return $user->id === $lesson->course->user_id;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Lesson $lesson): bool
    {
        // Instructor: Can view if they own the course
        if ($user->id === $lesson->course->user_id) {
            return true;
        }

        // Student: Can view if enrolled in the course
        if ($user->isStudent() && $lesson->course->enrollments()->where('user_id', $user->id)->exists()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only instructors can create lessons.
        // The check for course ownership will be handled in the controller or by passing the course to the policy method.
        // For now, let's assume if the user is an instructor, they might be able to create a lesson.
        // A more specific check like $user->id === $course->user_id should be done if $course is available.
        return $user->isInstructor();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Lesson $lesson): bool
    {
        return $user->id === $lesson->course->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Lesson $lesson): bool
    {
        return $user->id === $lesson->course->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Lesson $lesson): bool
    {
        return $user->id === $lesson->course->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Lesson $lesson): bool
    {
        return $user->id === $lesson->course->user_id;
    }
}
