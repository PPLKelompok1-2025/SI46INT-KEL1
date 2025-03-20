<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $sort = $request->input('sort', 'name_asc');
        $parentPage = $request->input('page', 1);
        $allPage = $request->input('allPage', 1);
        $perPage = 9;
        $allPerPage = 12;
        $isInitialRequest = !$request->header('X-Inertia-Partial-Data');
        $onlyParam = $request->header('X-Inertia-Partial-Component-Data', '');
        $isParentPagination = $onlyParam && str_contains($onlyParam, 'parentCategories') && !str_contains($onlyParam, 'allCategories');
        $isAllPagination = $onlyParam && str_contains($onlyParam, 'allCategories') && !str_contains($onlyParam, 'parentCategories');

        $parentCategoriesQuery = Category::whereNull('parent_id')
            ->with('children')
            ->withCount('courses');

        if ($search) {
            $parentCategoriesQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        switch ($sort) {
            case 'name_desc':
                $parentCategoriesQuery->orderByDesc('name');
                break;
            case 'courses_high':
                $parentCategoriesQuery->orderByDesc('courses_count');
                break;
            case 'courses_low':
                $parentCategoriesQuery->orderBy('courses_count');
                break;
            case 'newest':
                $parentCategoriesQuery->orderByDesc('created_at');
                break;
            case 'oldest':
                $parentCategoriesQuery->orderBy('created_at');
                break;
            case 'name_asc':
            default:
                $parentCategoriesQuery->orderBy('name');
                break;
        }

        $parentCategories = $parentCategoriesQuery->paginate($perPage);
        $categoryPagination = $parentCategories->toArray();
        $isNextPageExists = $categoryPagination['current_page'] < $categoryPagination['last_page'];

        $allCategoriesQuery = Category::withCount('courses');

        if ($search) {
            $allCategoriesQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        switch ($sort) {
            case 'name_desc':
                $allCategoriesQuery->orderByDesc('name');
                break;
            case 'courses_high':
                $allCategoriesQuery->orderByDesc('courses_count');
                break;
            case 'courses_low':
                $allCategoriesQuery->orderBy('courses_count');
                break;
            case 'newest':
                $allCategoriesQuery->orderByDesc('created_at');
                break;
            case 'oldest':
                $allCategoriesQuery->orderBy('created_at');
                break;
            case 'name_asc':
            default:
                $allCategoriesQuery->orderBy('name');
                break;
        }

        $allCategories = $allCategoriesQuery->paginate($allPerPage, ['*'], 'allPage');
        $allCategoriesPagination = $allCategories->toArray();
        $isAllNextPageExists = $allCategoriesPagination['current_page'] < $allCategoriesPagination['last_page'];

        return Inertia::render('Categories/Index', [
            'parentCategories' => ($isInitialRequest || $parentPage == 1 || !$isParentPagination)
                ? $parentCategories->items()
                : Inertia::merge($parentCategories->items()),
            'allCategories' => ($isInitialRequest || $allPage == 1 || !$isAllPagination)
                ? $allCategories->items()
                : Inertia::merge($allCategories->items()),
            'page' => $parentPage,
            'allPage' => $allPage,
            'isNextPageExists' => $isNextPageExists,
            'isAllNextPageExists' => $isAllNextPageExists,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
            ],
        ]);
    }

    public function show(Category $category, Request $request)
    {
        $category->load('parent', 'children');
        $category->loadCount(['courses', 'children']);

        $search = $request->input('search');
        $level = $request->input('level');
        $sort = $request->input('sort', 'latest');
        $page = $request->input('page', 1);
        $perPage = 9;
        $isInitialRequest = !$request->header('X-Inertia-Partial-Data');
        $onlyParam = $request->header('X-Inertia-Partial-Component-Data', '');
        $isCoursePagination = $onlyParam && str_contains($onlyParam, 'courses');

        $query = Course::where(function($q) use ($category) {
                $q->where('category_id', $category->id);

                if ($category->children->count() > 0) {
                    $q->orWhereIn('category_id', $category->children->pluck('id'));
                }
            })
            ->with('user:id,name')
            ->withCount(['lessons', 'enrollments', 'reviews']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        if ($level && $level !== '') {
            $query->where('level', $level);
        }

        switch ($sort) {
            case 'popular':
                $query->orderByDesc('enrollments_count');
                break;
            case 'rating':
                $query->addSelect([
                    DB::raw('(SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviews.course_id = courses.id) as average_rating')
                ])->orderByDesc('average_rating');
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
                break;
        }

        $courses = $query->paginate($perPage);

        $courses->each(function ($course) {
            $course->average_rating = $course->getAverageRatingAttribute();
        });

        $coursesPagination = $courses->toArray();
        $isNextPageExists = $coursesPagination['current_page'] < $coursesPagination['last_page'];

        $levels = Course::distinct()->pluck('level')->filter()->values();

        return Inertia::render('Categories/Show', [
            'category' => $category,
            'courses' => ($isInitialRequest || $page == 1 || !$isCoursePagination)
                ? $courses->items()
                : Inertia::merge($courses->items()),
            'levels' => $levels,
            'page' => $page,
            'isNextPageExists' => $isNextPageExists,
            'filters' => [
                'search' => $search,
                'level' => $level,
                'sort' => $sort,
            ],
        ]);
    }
}
