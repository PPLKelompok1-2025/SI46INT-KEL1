<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReviewController extends Controller
{
    /**
     * Display a listing of all reviews for instructor's courses.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $instructor = Auth::user();

        $courseIds = Course::where('user_id', $instructor->id)->pluck('id');

        $reviews = Review::whereIn('course_id', $courseIds)
            ->with(['user:id,name,email,profile_photo_path', 'course:id,title,slug'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Instructor/Reviews/Index', [
            'reviews' => $reviews,
        ]);
    }

    /**
     * Display reviews for a specific course.
     *
     * @param  \App\Models\Course  $course
     * @return \Inertia\Response
     */
    public function course(Course $course)
    {
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.reviews.index')
                ->with('error', 'You do not have permission to view reviews for this course');
        }

        $reviews = $course->reviews()
            ->with(['user:id,name,email,profile_photo_path'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Instructor/Reviews/Course', [
            'course' => $course,
            'reviews' => $reviews
        ]);
    }

    /**
     * Show details for a specific review.
     *
     * @param  \App\Models\Review  $review
     * @return \Inertia\Response
     */
    public function show(Review $review)
    {
        $course = $review->course;

        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.reviews.index')
                ->with('error', 'You do not have permission to view this review');
        }

        $review->load(['user:id,name,email,profile_photo_path', 'course:id,title,slug']);

        return Inertia::render('Instructor/Reviews/Show', [
            'review' => $review
        ]);
    }

    /**
     * Respond to a review (through course discussion or direct response).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Review  $review
     * @return \Illuminate\Http\RedirectResponse
     */
    public function respond(Request $request, Review $review)
    {
        $course = $review->course;

        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.reviews.index')
                ->with('error', 'You do not have permission to respond to this review');
        }

        $request->validate([
            'response' => 'required|string|max:1000',
        ]);

        $review->update([
            'instructor_response' => $request->response,
            'response_date' => now(),
        ]);

        return redirect()->route('instructor.reviews.show', $review->id)
            ->with('success', 'Response sent successfully');
    }

    /**
     * Report an inappropriate review.
     *
     * @param  \App\Models\Review  $review
     * @return \Illuminate\Http\RedirectResponse
     */
    public function report(Review $review)
    {
        $course = $review->course;

        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.reviews.index')
                ->with('error', 'You do not have permission to report this review');
        }

        $review->update(['is_reported' => true]);

        return redirect()->route('instructor.reviews.show', $review->id)
            ->with('success', 'Review reported to administrators');
    }
}
