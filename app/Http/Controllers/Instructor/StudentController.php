<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Display a listing of students enrolled in the instructor's courses.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $instructor = Auth::user();

        $courseIds = Course::where('user_id', $instructor->id)
            ->pluck('id');

        $query = Enrollment::whereIn('course_id', $courseIds)
            ->with([
                'user:id,name,email,profile_photo_path',
                'course:id,title,slug,user_id',
                'course.user:id,name'
            ]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('user', function($subQuery) use ($search) {
                    $subQuery->where('name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('course', function($subQuery) use ($search) {
                    $subQuery->where('title', 'like', "%{$search}%");
                });
            });
        }

        if ($request->filled('course') && $request->course !== 'all') {
            $query->where('course_id', $request->course);
        }

        if ($request->filled('date_range') && $request->date_range !== 'all') {
            $dateRange = $request->date_range;
            if ($dateRange === 'last_week') {
                $query->whereBetween('created_at', [now()->subWeek(), now()]);
            } elseif ($dateRange === 'last_month') {
                $query->whereBetween('created_at', [now()->subMonth(), now()]);
            } elseif ($dateRange === 'last_3_months') {
                $query->whereBetween('created_at', [now()->subMonths(3), now()]);
            } elseif ($dateRange === 'last_6_months') {
                $query->whereBetween('created_at', [now()->subMonths(6), now()]);
            } elseif ($dateRange === 'last_year') {
                $query->whereBetween('created_at', [now()->subYear(), now()]);
            }
        }

        if ($request->filled('sort')) {
            $sort = $request->sort;

            if ($sort === 'created_at_asc') {
                $query->orderBy('created_at', 'asc');
            } elseif ($sort === 'created_at_desc') {
                $query->orderBy('created_at', 'desc');
            } elseif ($sort === 'user.name_asc') {
                $query->join('users', 'enrollments.user_id', '=', 'users.id')
                      ->orderBy('users.name', 'asc')
                      ->select('enrollments.*');
            } elseif ($sort === 'user.name_desc') {
                $query->join('users', 'enrollments.user_id', '=', 'users.id')
                      ->orderBy('users.name', 'desc')
                      ->select('enrollments.*');
            } else {
                $query->orderBy('created_at', 'desc');
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $enrollments = $query->paginate(10)->withQueryString();

        $stats = [
            'totalStudents' => Enrollment::whereIn('course_id', $courseIds)
                ->distinct('user_id')
                ->count('user_id'),
            'totalEnrollments' => Enrollment::whereIn('course_id', $courseIds)->count(),
            'recentEnrollments' => Enrollment::whereIn('course_id', $courseIds)
                ->where('created_at', '>=', now()->subDays(30))
                ->count(),
            'courseDistribution' => Course::where('user_id', $instructor->id)
                ->withCount('enrollments')
                ->get()
                ->pluck('enrollments_count', 'title')
                ->toArray(),
            'activeStudents' => Enrollment::whereIn('course_id', $courseIds)
                ->whereHas('completedLessons')
                ->distinct('user_id')
                ->count('user_id')
        ];

        $courses = Course::where('user_id', $instructor->id)
            ->select('id', 'title')
            ->get();

        return Inertia::render('Instructor/Students/Index', [
            'enrollments' => $enrollments,
            'stats' => $stats,
            'courses' => $courses,
            'filters' => [
                'search' => $request->input('search', ''),
                'course' => $request->input('course', 'all'),
                'date_range' => $request->input('date_range', 'all'),
                'sort' => $request->input('sort', 'created_at_desc'),
            ],
        ]);
    }

    /**
     * Display students enrolled in a specific course.
     *
     * @param  \App\Models\Course  $course
     * @return \Inertia\Response
     */
    public function course(Request $request, Course $course)
    {
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.students.index')
                ->with('error', 'You do not have permission to view students for this course');
        }

        $query = $course->enrollments()
            ->with([
                'user:id,name,email,profile_photo_path',
                'course:id,title,slug,user_id',
                'course.user:id,name'
            ]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function($subQuery) use ($search) {
                $subQuery->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_range') && $request->date_range !== 'all') {
            $dateRange = $request->date_range;
            if ($dateRange === 'last_week') {
                $query->whereBetween('created_at', [now()->subWeek(), now()]);
            } elseif ($dateRange === 'last_month') {
                $query->whereBetween('created_at', [now()->subMonth(), now()]);
            } elseif ($dateRange === 'last_3_months') {
                $query->whereBetween('created_at', [now()->subMonths(3), now()]);
            } elseif ($dateRange === 'last_6_months') {
                $query->whereBetween('created_at', [now()->subMonths(6), now()]);
            } elseif ($dateRange === 'last_year') {
                $query->whereBetween('created_at', [now()->subYear(), now()]);
            }
        }

        if ($request->filled('sort')) {
            $sort = $request->sort;

            if ($sort === 'created_at_asc') {
                $query->orderBy('created_at', 'asc');
            } elseif ($sort === 'created_at_desc') {
                $query->orderBy('created_at', 'desc');
            } elseif ($sort === 'user.name_asc') {
                $query->join('users', 'enrollments.user_id', '=', 'users.id')
                      ->orderBy('users.name', 'asc')
                      ->select('enrollments.*');
            } elseif ($sort === 'user.name_desc') {
                $query->join('users', 'enrollments.user_id', '=', 'users.id')
                      ->orderBy('users.name', 'desc')
                      ->select('enrollments.*');
            } else {
                $query->orderBy('created_at', 'desc');
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $enrollments = $query->paginate(10)->withQueryString();

        $stats = [
            'totalEnrollments' => $course->enrollments()->count(),
            'recentEnrollments' => $course->enrollments()->where('created_at', '>=', now()->subDays(30))->count(),
            'activeStudents' => $course->enrollments()->whereHas('completedLessons')->count(),
            'completionRate' => $course->lessons()->count() > 0
                ? round(($course->enrollments()->whereNotNull('completed_at')->count() / max(1, $course->enrollments()->count())) * 100, 1)
                : 0,
        ];

        return Inertia::render('Instructor/Students/Course', [
            'course' => $course,
            'enrollments' => $enrollments,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search', ''),
                'date_range' => $request->input('date_range', 'all'),
                'sort' => $request->input('sort', 'created_at_desc'),
            ],
        ]);
    }

    /**
     * Display details about a specific student's enrollment.
     *
     * @param  \App\Models\Enrollment  $enrollment
     * @return \Inertia\Response
     */
    public function show(Request $request, Enrollment $enrollment)
    {
        $course = $enrollment->course;

        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.students.index')
                ->with('error', 'You do not have permission to view this student');
        }

        $enrollment->load([
            'user:id,name,email,profile_photo_path',
            'course:id,title,slug,user_id',
            'course.user:id,name',
        ]);

        $completedLessonsQuery = $enrollment->completedLessons();

        if ($request->filled('search')) {
            $search = $request->search;
            $completedLessonsQuery->where('title', 'like', "%{$search}%");
        }

        if ($request->filled('sort')) {
            $sort = $request->sort;
            if ($sort === 'completed_at_asc') {
                $completedLessonsQuery->orderBy('lesson_completions.created_at', 'asc');
            } elseif ($sort === 'completed_at_desc') {
                $completedLessonsQuery->orderBy('lesson_completions.created_at', 'desc');
            } elseif ($sort === 'title_asc') {
                $completedLessonsQuery->orderBy('title', 'asc');
            } elseif ($sort === 'title_desc') {
                $completedLessonsQuery->orderBy('title', 'desc');
            }
        } else {
            $completedLessonsQuery->orderBy('lesson_completions.created_at', 'desc');
        }

        $completedLessons = $completedLessonsQuery
            ->select('lessons.*', 'lesson_completions.created_at as completed_at')
            ->paginate(10)
            ->withQueryString();

        $totalLessons = $course->lessons()->count();
        $completedLessonsCount = $enrollment->completedLessons()->count();

        if ($enrollment->progress !== null) {
            $progressPercentage = (float)$enrollment->progress;
            $displayedCompleted = floor(($progressPercentage / 100) * $totalLessons);
        } else {
            $progressPercentage = $totalLessons > 0 ? ($completedLessonsCount / $totalLessons) * 100 : 0;
            $displayedCompleted = $completedLessonsCount;
        }

        if ($enrollment->completed_at !== null) {
            $progressPercentage = 100;
            $displayedCompleted = $totalLessons;
        }

        $lastActivity = $enrollment->completedLessons()
            ->orderBy('lesson_completions.created_at', 'desc')
            ->first();

        $otherEnrollments = Enrollment::where('user_id', $enrollment->user_id)
            ->whereIn('course_id',
                Course::where('user_id', Auth::id())->pluck('id')
            )
            ->where('id', '!=', $enrollment->id)
            ->with('course:id,title,slug')
            ->get();

        return Inertia::render('Instructor/Students/Show', [
            'enrollment' => $enrollment,
            'completedLessons' => $completedLessons,
            'progress' => [
                'completed' => $displayedCompleted,
                'total' => $totalLessons,
                'percentage' => round($progressPercentage, 1)
            ],
            'lastActivity' => $lastActivity ? $lastActivity->pivot->created_at : null,
            'otherEnrollments' => $otherEnrollments,
            'enrollmentDate' => $enrollment->created_at,
            'filters' => [
                'search' => $request->input('search', ''),
                'sort' => $request->input('sort', 'completed_at_desc'),
            ]
        ]);
    }

    /**
     * Remove a student from a course.
     *
     * @param  \App\Models\Enrollment  $enrollment
     * @return \Illuminate\Http\RedirectResponse
     */
    public function removeStudent(Enrollment $enrollment)
    {
        $course = $enrollment->course;

        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.students.index')
                ->with('error', 'You do not have permission to remove this student');
        }

        $courseId = $course->id;

        $enrollment->delete();

        return redirect()->route('instructor.students.course', $courseId)
            ->with('success', 'Student removed from course successfully');
    }
}
