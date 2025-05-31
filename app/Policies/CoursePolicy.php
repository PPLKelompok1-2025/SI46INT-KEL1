<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CoursePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Example: Allow admins to view all, instructors to view their own
        if ($user->isAdmin()) {
            return true;
        }
        // For instructors, specific logic for their courses might be in controller or a more specific policy method.
        return $user->isInstructor();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Course $course): bool
    {
        // Instructors can view their own courses
        if ($user->isInstructor() && $user->id === $course->user_id) {
            return true;
        }
        // Students can view published and approved courses they are enrolled in
        if ($user->isStudent() && $course->is_published && $course->is_approved && $course->enrollments()->where('user_id', $user->id)->exists()) {
            return true;
        }
        // Admins can view any course
        if ($user->isAdmin()) {
            return true;
        }
        // Public published and approved courses
        if ($course->is_published && $course->is_approved) {
            // This could be true for guest users as well, handled by allowing if $user is null or guest
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isInstructor() || $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Course $course): bool
    {
        return $user->id === $course->user_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Course $course): bool
    {
        // Prevent deletion if there are enrollments, unless admin
        if ($course->enrollments()->exists() && !$user->isAdmin()) {
            return false;
        }
        return $user->id === $course->user_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Course $course): bool
    {
        return $user->id === $course->user_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Course $course): bool
    {
        return $user->id === $course->user_id || $user->isAdmin();
    }
}
