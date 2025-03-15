<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::query()
            ->withCount(['courses', 'enrollments', 'reviews', 'transactions']);

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('role') && $request->get('role') !== 'all') {
            $query->where('role', $request->get('role'));
        }

        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $users = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_field', 'sort_direction']),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        return Inertia::render('Admin/Users/Create');
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:admin,instructor,student',
            'bio' => 'nullable|string',
            'headline' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'twitter' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|max:255',
            'youtube' => 'nullable|string|max:255',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user, Request $request)
    {
        $user->loadCount(['courses', 'enrollments', 'reviews', 'transactions']);

        $tab = $request->input('tab', 'overview');

        if ($tab === 'courses' && $user->role === 'instructor') {
            $courses = $user->courses()
                ->withCount('enrollments')
                ->with('category')
                ->withAvg('reviews', 'rating')
                ->latest()
                ->paginate(10)
                ->withQueryString();

            $user->setRelation('courses', $courses);
        }

        if ($tab === 'enrollments' && ($user->role === 'student' || $user->role === 'instructor')) {
            $enrollments = $user->enrollments()
                ->with('course')
                ->latest()
                ->paginate(10)
                ->withQueryString();

            $user->setRelation('enrollments', $enrollments);
        }

        if ($tab === 'reviews') {
            $reviews = $user->reviews()
                ->with('course')
                ->latest()
                ->paginate(10)
                ->withQueryString();

            $user->setRelation('reviews', $reviews);
        }

        if ($tab === 'transactions') {
            $transactions = $user->transactions()
                ->latest()
                ->paginate(10)
                ->withQueryString();

            $user->setRelation('transactions', $transactions);
        }

        if ($tab === 'courses' && isset($user->courses) && $user->courses->count() > 0) {
            foreach ($user->courses as $course) {
                if ($course->reviews_avg_rating) {
                    $course->setAttribute('average_rating', $course->reviews_avg_rating);
                }
            }
        }

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'tab' => $tab,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => 'required|string|in:admin,instructor,student',
            'bio' => 'nullable|string',
            'headline' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'twitter' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|max:255',
            'youtube' => 'nullable|string|max:255',
            'profile_photo_path' => 'nullable|string',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        if ($user->getKey() === Auth::id()) {
            return redirect()->route('admin.users.index')->with('error', 'You cannot delete your own account.');
        }

        if ($user->courses()->count() > 0 || $user->enrollments()->count() > 0) {
            return redirect()->route('admin.users.index')->with('error', 'This user has associated courses or enrollments and cannot be deleted.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }
}
