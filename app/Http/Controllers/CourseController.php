<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\PromoCodes;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
        /**
     * Show the checkout page for a course
     *
     * @param  \App\Models\Course  $course
     * @return \Inertia\Response
     */
    public function checkout(Course $course, Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login', [
                'redirect_to' => route('payment.checkout', $course->id)
            ]);
        }

        if ($user->id === $course->user_id) {
            return redirect()->route('instructor.courses.show', $course->id)
                ->with('error', 'You cannot enroll in your own course');
        }

        $existingEnrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existingEnrollment) {
            return redirect()->route('student.courses.show', $course->slug)
                ->with('info', 'You are already enrolled in this course');
        }

        $promoCodes = PromoCodes::where('is_active', true)
            ->whereDate('start_date', '<=', now())
            ->where(function ($query) {
                $query->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', now());
            })
            ->where(function ($query) use ($course) {
                $query->where('min_cart_value', '<=', $course->price)
                    ->orWhereNull('min_cart_value');
            })
            ->where(function ($query) {
                $query->whereNull('max_uses')
                    ->orWhere('used_count', '<', \Illuminate\Support\Facades\DB::raw('max_uses'));
            })
            ->get();

        return \Inertia\Inertia::render('Courses/Checkout', [
            'course' => $course,
            'promoCodes' => $promoCodes,
            'tax' => config('payment.tax_percentage', 0),
        ]);
    }
}
