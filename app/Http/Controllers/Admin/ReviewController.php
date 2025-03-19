<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReviewController extends Controller
{
    /**
     * Display a listing of all reviews with filters.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $query = Review::query()
            ->with(['user:id,name,email,profile_photo_path'])
            ->with(['course:id,title,slug,user_id'])
            ->with(['course.user:id,name,email'])
            ->whereHas('course')
            ->orderBy('created_at', 'desc');

        if ($request->has('course_id') && $request->course_id) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->has('instructor_id') && $request->instructor_id) {
            $query->whereHas('course', function ($q) use ($request) {
                $q->where('user_id', $request->instructor_id);
            });
        }

        if ($request->has('rating') && $request->rating) {
            $query->where('rating', $request->rating);
        }

        if ($request->has('reported') && $request->reported) {
            $query->where('is_reported', true);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('course', function ($sq) use ($search) {
                      $sq->where('title', 'like', "%{$search}%");
                  });
            });
        }

        $reviews = $query->paginate(10)->withQueryString();

        $courses = Course::select('id', 'title')->orderBy('title')->get();

        $instructorIds = Course::distinct()->pluck('user_id');
        $instructors = User::whereIn('id', $instructorIds)
                        ->select('id', 'name')
                        ->orderBy('name')
                        ->get();

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews,
            'filters' => $request->only(['course_id', 'instructor_id', 'rating', 'reported', 'search']),
            'courses' => $courses,
            'instructors' => $instructors,
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
        $reviews = $course->reviews()
            ->with(['user:id,name,email,profile_photo_path'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/Reviews/Course', [
            'course' => $course->load('user:id,name,email'),
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
        $review->load([
            'user:id,name,email,profile_photo_path',
            'course:id,title,slug',
            'course.user:id,name,email'
        ]);

        return Inertia::render('Admin/Reviews/Show', [
            'review' => $review
        ]);
    }

    /**
     * Approve a review that was reported.
     *
     * @param  \App\Models\Review  $review
     * @return \Illuminate\Http\RedirectResponse
     */
    public function approveReported(Review $review)
    {
        $review->update(['is_reported' => false]);

        return redirect()->back()->with('success', 'Review approved and no longer marked as reported');
    }

    /**
     * Edit a review.
     *
     * @param  \App\Models\Review  $review
     * @return \Inertia\Response
     */
    public function edit(Review $review)
    {
        $review->load([
            'user:id,name,email',
            'course:id,title,slug'
        ]);

        return Inertia::render('Admin/Reviews/Edit', [
            'review' => $review
        ]);
    }

    /**
     * Update a review.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Review  $review
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Review $review)
    {
        $request->validate([
            'comment' => 'required|string|max:1000',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $review->update([
            'comment' => $request->comment,
            'rating' => $request->rating,
            'is_reported' => $request->is_reported ?? false,
        ]);

        return redirect()->route('admin.reviews.show', $review->id)
            ->with('success', 'Review updated successfully');
    }

    /**
     * Delete a review.
     *
     * @param  \App\Models\Review  $review
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Review $review)
    {
        $review->delete();

        return redirect()->route('admin.reviews.index')
            ->with('success', 'Review deleted successfully');
    }

    /**
     * Display a list of all reported reviews.
     *
     * @return \Inertia\Response
     */
    public function reported()
    {
        $reviews = Review::where('is_reported', true)
            ->with(['user:id,name,email,profile_photo_path', 'course:id,title,slug', 'course.user:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/Reviews/Reported', [
            'reviews' => $reviews
        ]);
    }

    /**
     * Respond to a review (as an admin).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Review  $review
     * @return \Illuminate\Http\RedirectResponse
     */
    public function respond(Request $request, Review $review)
    {
        $request->validate([
            'response' => 'required|string|max:1000',
        ]);

        $review->update([
            'admin_response' => $request->response,
            'admin_response_date' => now(),
        ]);

        return redirect()->route('admin.reviews.show', $review->id)
            ->with('success', 'Admin response sent successfully');
    }
}
