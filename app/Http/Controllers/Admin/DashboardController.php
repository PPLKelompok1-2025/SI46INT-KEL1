<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Course;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\Enrollment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $activeTab = $request->query('tab', 'overview');

        $stats = [
            'totalStudents' => User::where('role', 'student')->count(),
            'totalInstructors' => User::where('role', 'instructor')->count(),
            'totalCourses' => Course::count(),
            'totalRevenue' => Transaction::where('status', 'completed')->sum('amount'),
            'totalEnrollments' => Enrollment::count(),
            'pendingCourses' => Course::where('is_approved', false)->count(),
        ];

        $recentTransactions = [];
        $recentUsers = [];
        $recentCourses = [];
        $monthlyRevenue = [];
        $monthlyEnrollments = [];
        $popularCourses = [];
        $categoryDistribution = [];
        $userRoleDistribution = [];

        if (in_array($activeTab, ['overview', 'transactions'])) {
            $recentTransactions = Transaction::with(['user', 'course'])
                ->where('status', 'completed')
                ->orderBy('created_at', 'desc')
                ->take($activeTab === 'transactions' ? 15 : 5)
                ->get();
        }

        if (in_array($activeTab, ['overview', 'users'])) {
            $recentUsers = User::orderBy('created_at', 'desc')
                ->take($activeTab === 'users' ? 15 : 5)
                ->get();

            $userRoleDistribution = $this->getUserRoleDistribution();
        }

        if (in_array($activeTab, ['overview', 'courses'])) {
            $recentCourses = Course::with(['user', 'category'])
                ->withCount(['lessons', 'enrollments', 'reviews'])
                ->orderBy('created_at', 'desc')
                ->take($activeTab === 'courses' ? 15 : 5)
                ->get()
                ->each(function ($course) {
                    $course->average_rating = $course->getAverageRatingAttribute();
                });

            $categoryDistribution = $this->getCategoryDistribution();
            $popularCourses = $this->getPopularCourses();
        }

        if ($activeTab === 'overview') {
            $monthlyRevenue = $this->getMonthlyRevenue();
            $monthlyEnrollments = $this->getMonthlyEnrollments();
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentTransactions' => $recentTransactions,
            'recentUsers' => $recentUsers,
            'recentCourses' => $recentCourses,
            'monthlyRevenue' => $monthlyRevenue,
            'monthlyEnrollments' => $monthlyEnrollments,
            'popularCourses' => $popularCourses,
            'categoryDistribution' => $categoryDistribution,
            'userRoleDistribution' => $userRoleDistribution,
        ]);
    }

    private function getMonthlyRevenue()
    {
        $currentYear = Carbon::now()->year;

        return Transaction::select(
                DB::raw('EXTRACT(MONTH FROM created_at) as month'),
                DB::raw('SUM(amount) as total')
            )
            ->where('status', 'completed')
            ->whereYear('created_at', $currentYear)
            ->groupBy(DB::raw('EXTRACT(MONTH FROM created_at)'))
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::create(null, $item->month, 1)->format('M'),
                    'total' => (float) $item->total,
                ];
            });
    }

    private function getMonthlyEnrollments()
    {
        $currentYear = Carbon::now()->year;

        return Enrollment::select(
                DB::raw('EXTRACT(MONTH FROM created_at) as month'),
                DB::raw('COUNT(*) as total')
            )
            ->whereYear('created_at', $currentYear)
            ->groupBy(DB::raw('EXTRACT(MONTH FROM created_at)'))
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::create(null, $item->month, 1)->format('M'),
                    'total' => (int) $item->total,
                ];
            });
    }

    private function getPopularCourses()
    {
        return Course::withCount('enrollments')
            ->orderBy('enrollments_count', 'desc')
            ->take(5)
            ->get()
            ->map(function ($course) {
                return [
                    'course' => $course->title,
                    'total' => $course->enrollments_count,
                ];
            });
    }

    private function getCategoryDistribution()
    {
        return Category::whereHas('courses')
            ->withCount('courses')
            ->orderBy('courses_count', 'desc')
            ->get()
            ->map(function ($category) {
                return [
                    'category' => $category->name,
                    'total' => $category->courses_count,
                ];
            });
    }

    private function getUserRoleDistribution()
    {
        return User::select('role', DB::raw('count(*) as total'))
            ->groupBy('role')
            ->get()
            ->map(function ($user) {
                return [
                    'role' => ucfirst($user->role),
                    'total' => $user->total,
                ];
            });
    }
}
