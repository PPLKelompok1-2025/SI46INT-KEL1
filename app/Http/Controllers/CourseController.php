<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Display a paginated listing of published courses.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $category = $request->input('category');
        $level = $request->input('level');
        $search = $request->input('search');
        $sort = $request->input('sort', 'latest');
        $page = $request->input('page', 1);
        $perPage = 9;

        $query = Course::where('is_published', true)
            ->where('is_approved', true)
            ->with(['category', 'user:id,name,profile_photo_path'])
            ->withCount(['lessons', 'enrollments', 'reviews']);

        if ($category) {
            $query->where('category_id', $category);
        }

        if ($level) {
            $query->where('level', $level);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        switch ($sort) {
            case 'popular':
                $query->orderByDesc('enrollments_count');
                break;
            case 'rating':
                $query->orderByRaw('(SELECT AVG(rating) FROM reviews WHERE reviews.course_id = courses.id AND reviews.is_approved = true) DESC NULLS LAST');
                break;
            case 'price_low':
                $query->orderBy('price');
                break;
            case 'price_high':
                $query->orderByDesc('price');
                break;
            case 'latest':
            default:
                $query->orderByDesc('created_at');
        }

        $courses = $query->paginate($perPage);

        $courses->each(function ($course) {
            $course->average_rating = $course->reviews()
                ->where('is_approved', true)
                ->avg('rating') ?? 0;
        });

        $categories = Category::orderBy('name')->get();
        $levels = Course::distinct()->pluck('level')->filter()->values();

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
            'filters' => [
                'category' => $category,
                'level' => $level,
                'search' => $search,
                'sort' => $sort,
            ],
            'categories' => $categories,
            'levels' => $levels,
        ]);
    }

    /**
     * Display the specified course.
     *
     * @param  string  $slug
     * @return \Inertia\Response
     */
    public function show($slug, Request $request)
    {
        $course = Course::where('slug', $slug)
            ->where('is_published', true)
            ->where('is_approved', true)
            ->with([
                'category',
                'user:id,name,profile_photo_path,bio',
                'lessons' => function ($query) {
                    $query->select('id', 'course_id', 'title', 'description', 'duration', 'order')
                          ->orderBy('order');
                }
            ])
            ->withCount(['lessons', 'enrollments', 'reviews'])
            ->firstOrFail();

        $course->append('average_rating');

        $reviews = $course->reviews()
            ->where('is_approved', true)
            ->with('user:id,name,profile_photo_path')
            ->latest()
            ->take(5)
            ->get();

        $similarCourses = Course::where('category_id', $course->category_id)
            ->where('id', '!=', $course->id)
            ->where('is_published', true)
            ->where('is_approved', true)
            ->inRandomOrder()
            ->take(3)
            ->get();

        $activeTab = $request->input('tab', 'overview');

        return Inertia::render('Courses/Show', [
            'course' => $course,
            'reviews' => $reviews,
            'similarCourses' => $similarCourses,
            'activeTab' => $activeTab,
        ]);
    }
}
