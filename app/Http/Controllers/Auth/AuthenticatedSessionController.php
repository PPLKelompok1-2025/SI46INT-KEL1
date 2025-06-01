<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(Request $request): Response
    {
        if ($request->has('redirect_to')) {
            $request->session()->put('url.intended', $request->input('redirect_to'));
        }

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => \Illuminate\Support\Facades\Session::get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // First determine the default URL based on user role
        $defaultUrl = route('student.dashboard');

        if (Auth::user()->isAdmin()) {
            $defaultUrl = route('admin.dashboard');
        } else if (Auth::user()->isInstructor()) {
            $defaultUrl = route('instructor.dashboard');
        }

        // Redirect to the intended URL or the default URL based on role
        return redirect()->intended($defaultUrl);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        if ($request->boolean('withRedirect')) {
            return redirect()->route('login');
        }
    }
}
