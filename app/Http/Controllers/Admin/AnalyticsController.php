<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index()
    {
        $startDate = request('start_date', Carbon::now()->subDays(30));
        $endDate = request('end_date', Carbon::now());

        if (is_string($startDate)) {
            $startDate = Carbon::parse($startDate);
        }
        if (is_string($endDate)) {
            $endDate = Carbon::parse($endDate);
        }

        $totalRevenue = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->sum('amount');

        $totalEnrollments = Enrollment::whereBetween('created_at', [$startDate, $endDate])->count();

        $totalNewUsers = User::whereBetween('created_at', [$startDate, $endDate])->count();

        $topCourses = Course::withCount(['enrollments' => function ($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }])
        ->orderByDesc('enrollments_count')
        ->take(5)
        ->get();

        $dailyRevenue = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $dailyEnrollments = Enrollment::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Admin/Analytics/Index', [
            'stats' => [
                'totalRevenue' => $totalRevenue,
                'totalEnrollments' => $totalEnrollments,
                'totalNewUsers' => $totalNewUsers,
            ],
            'topCourses' => $topCourses,
            'dailyRevenue' => $dailyRevenue,
            'dailyEnrollments' => $dailyEnrollments,
            'dateRange' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
        ]);
    }
}