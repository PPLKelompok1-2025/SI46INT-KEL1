<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Course;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingController extends Controller
{
    /**
     * Display the landing page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $data = [
            'featuredCategories' => $this->getFeaturedCategories(),
            'statistics' => $this->getStatistics(),
            'testimonials' => $this->getTestimonials(),
        ];

        return Inertia::render('Welcome', $data);
    }

    /**
     * Handle quick search from the welcome page.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $query = $request->input('query');
        $results = [
            'courses' => [],
            'categories' => [],
            'instructors' => []
        ];

        if ($query) {
            $results['courses'] = Course::where('is_published', true)
                ->where('is_approved', true)
                ->where(function($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('short_description', 'like', "%{$query}%");
                })
                ->with('user:id,name,profile_photo_path')
                ->take(5)
                ->get(['id', 'title', 'slug', 'thumbnail', 'user_id'])
                ->map(function($course) {
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'slug' => $course->slug,
                        'thumbnail' => $course->thumbnail,
                        'instructor' => $course->user->name,
                        'type' => 'course',
                        'url' => route('courses.show', $course->slug)
                    ];
                });

            $results['categories'] = Category::where('name', 'like', "%{$query}%")
                ->take(5)
                ->get(['id', 'name', 'slug', 'icon'])
                ->map(function($category) {
                    return [
                        'id' => $category->id,
                        'title' => $category->name,
                        'slug' => $category->slug,
                        'icon' => $category->icon,
                        'type' => 'category',
                        'url' => route('categories.show', $category->slug)
                    ];
                });

            $results['instructors'] = User::where('role', 'instructor')
                ->where(function($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                      ->orWhere('headline', 'like', "%{$query}%");
                })
                ->take(5)
                ->get(['id', 'name', 'profile_photo_path', 'headline'])
                ->map(function($instructor) {
                    return [
                        'id' => $instructor->id,
                        'title' => $instructor->name,
                        'subtitle' => $instructor->headline,
                        'avatar' => $instructor->profile_photo_path ??
                            "https://ui-avatars.com/api/?name=" . urlencode($instructor->name) . "&color=7F9CF5&background=EBF4FF",
                        'type' => 'instructor',
                        'url' => route('courses.index', ['instructor' => $instructor->id])
                    ];
                });
        }

        return response()->json($results);
    }

    /**
     * Get featured categories for the landing page.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getFeaturedCategories()
    {
        // Get categories with the most courses
        return Category::withCount('courses')
            ->orderBy('courses_count', 'desc')
            ->take(12)
            ->get(['id', 'name', 'slug', 'icon']);
    }

    /**
     * Get platform statistics for the landing page.
     *
     * @return array
     */
    private function getStatistics()
    {
        return [
            'totalCourses' => Course::where('is_published', true)->count(),
            'totalInstructors' => User::where('role', 'instructor')->count(),
            'totalStudents' => User::where('role', 'student')->count(),
        ];
    }

    /**
     * Get testimonials for the landing page.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getTestimonials()
    {
        // Option 1: Get actual reviews from the database if available
        $reviews = Review::with(['user' => function ($query) {
            $query->select('id', 'name', 'profile_photo_path', 'role');
        }])
        ->where('rating', '>=', 4) // Only show positive reviews
        ->latest()
        ->take(3)
        ->get();

        // If we have real reviews, format them for the frontend
        if ($reviews->isNotEmpty()) {
            return $reviews->map(function ($review) {
                return [
                    'name' => $review->user->name,
                    'role' => ucfirst($review->user->role),
                    'content' => $review->comment,
                    'avatar' => $review->user->profile_photo_path ??
                        "https://ui-avatars.com/api/?name=" . urlencode($review->user->name) . "&color=7F9CF5&background=EBF4FF",
                ];
            });
        }

        // Option 2: Fallback to sample testimonials if no reviews are available
        return $this->getSampleTestimonials();
    }

    /**
     * Get sample testimonials for the landing page.
     *
     * @return array
     */
    private function getSampleTestimonials()
    {
        return [
            [
                'name' => 'Sarah Johnson',
                'role' => 'Web Developer',
                'content' => 'Coursepedia helped me transition from a beginner to a professional web developer in just 6 months. The hands-on projects and supportive community made all the difference.',
                'avatar' => 'https://randomuser.me/api/portraits/women/44.jpg',
            ],
            [
                'name' => 'David Chen',
                'role' => 'Data Scientist',
                'content' => 'The data science courses are comprehensive and up-to-date with industry standards. I landed my dream job thanks to the skills I learned through Coursepedia.',
                'avatar' => 'https://randomuser.me/api/portraits/men/46.jpg',
            ],
            [
                'name' => 'Emma Williams',
                'role' => 'UX Designer',
                'content' => 'The design courses offer practical knowledge that I apply daily in my work. The instructors are experienced professionals who share valuable industry insights.',
                'avatar' => 'https://randomuser.me/api/portraits/women/63.jpg',
            ],
        ];
    }
}