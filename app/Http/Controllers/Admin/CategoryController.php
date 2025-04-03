<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $parent = $request->input('parent');
        $sort = $request->input('sort', 'name_asc');

        $query = Category::query()
            ->withCount(['courses', 'children'])
            ->with('parent');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        if ($parent === 'parent') {
            $query->whereNull('parent_id');
        } elseif ($parent === 'child') {
            $query->whereNotNull('parent_id');
        }

        switch ($sort) {
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'created_at_desc':
                $query->orderBy('created_at', 'desc');
                break;
            case 'created_at_asc':
                $query->orderBy('created_at', 'asc');
                break;
            case 'courses_count_desc':
                $query->orderByDesc('courses_count');
                break;
            case 'courses_count_asc':
                $query->orderBy('courses_count', 'asc');
                break;
            case 'name_asc':
            default:
                $query->orderBy('name', 'asc');
                break;
        }

        $categories = $query->paginate(10)->withQueryString();

        $stats = [
            'total' => Category::count(),
            'parent' => Category::whereNull('parent_id')->count(),
            'child' => Category::whereNotNull('parent_id')->count(),
            'totalCourses' => Course::count(),
        ];

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'parent' => $parent,
                'sort' => $sort,
            ],
            'stats' => $stats
        ]);
    }

    /**
     * Show the form for creating a new category.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        $parentCategories = Category::whereNull('parent_id')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Categories/Create', [
            'parentCategories' => $parentCategories,
        ]);
    }

    /**
     * Store a newly created category in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'icon' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'parent_id' => $request->parent_id,
            'icon' => $request->icon,
        ]);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified category.
     *
     * @param  \App\Models\Category  $category
     * @return \Inertia\Response
     */
    public function show(Category $category)
    {
        $category->load('parent', 'children');
        $category->loadCount('courses');

        $courses = Course::where('category_id', $category->id)
            ->with('user:id,name')
            ->withCount(['lessons', 'enrollments', 'reviews'])
            ->latest()
            ->paginate(10);

        $courses->each(function ($course) {
            $course->average_rating = $course->getAverageRatingAttribute();
        });

        return Inertia::render('Admin/Categories/Show', [
            'category' => $category,
            'courses' => $courses,
        ]);
    }

    /**
     * Show the form for editing the specified category.
     *
     * @param  \App\Models\Category  $category
     * @return \Inertia\Response
     */
    public function edit(Category $category)
    {
        $parentCategories = Category::whereNull('parent_id')
            ->where('id', '!=', $category->id)
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
            'parentCategories' => $parentCategories,
        ]);
    }

    /**
     * Update the specified category in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Category $category)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'icon' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Ensure a category cannot be its own parent or a child of one of its descendants
        if ($request->parent_id) {
            $parent = Category::findOrFail($request->parent_id);

            // Check if the selected parent is a descendant of the current category
            $invalidParent = false;
            $current = $parent;

            while ($current && !$invalidParent) {
                if ($current->id === $category->id) {
                    $invalidParent = true;
                }
                $current = $current->parent;
            }

            if ($invalidParent) {
                return redirect()->back()
                    ->withErrors(['parent_id' => 'You cannot select a descendant as a parent'])
                    ->withInput();
            }
        }

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'parent_id' => $request->parent_id,
            'icon' => $request->icon,
        ]);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified category from storage.
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Category $category)
    {
        // Check if there are courses in this category
        $coursesCount = $category->courses()->count();

        if ($coursesCount > 0) {
            return redirect()->back()
                ->with('error', "Cannot delete category because it contains {$coursesCount} courses. Please reassign them first.");
        }

        // Check if there are subcategories
        $childrenCount = $category->children()->count();

        if ($childrenCount > 0) {
            return redirect()->back()
                ->with('error', "Cannot delete category because it contains {$childrenCount} subcategories. Please delete or reassign them first.");
        }

        $category->delete();

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category deleted successfully.');
    }
}
