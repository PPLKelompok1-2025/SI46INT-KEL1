<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Display a list of registered users
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function users(Request $request)
    {
        $query = User::query()
            ->select(['id','name','email','role','created_at']);

        if ($search = $request->input('search')) {
            $query->where(fn($q) =>
                $q->where('name',  'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
            );
        }
        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        $users = $query
            ->orderBy('created_at','desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users'   => $users,
            'filters' => [
                'search' => $request->input('search',''),
                'role'   => $request->input('role','all'),
            ],
        ]);
    }

    /**
     * Show a single user in the edit form
     * @param  \App\Models\User  $user
     * @return \Inertia\Response
     */
    public function showUser(User $user)
    {
        return Inertia::render('Admin/Users/Show', [
            'user' => $user->only(['id','name','email','role','created_at'])
        ]);
    }

    /**
     * Update user data
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User          $user
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => ['required','email','max:255',
                        Rule::unique('users')->ignore($user->id)],
            'role'  => 'required|in:student,instructor,admin',
        ]);

        $user->update($data);

        return back()->with('success', 'User updated successfully.');
    }

    /**
     * Delete user data
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroyUser(User $user)
    {
        // Optionally prevent self‑deletion or admin deletion:
        if (auth()->id() === $user->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }
}