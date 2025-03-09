<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Transaction;
use App\Models\WithdrawalRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EarningController extends Controller
{
    /**
     * Display the instructor's earnings dashboard.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $instructor = Auth::user();

        // Get all courses by this instructor
        $courseIds = Course::where('user_id', $instructor->id)
            ->pluck('id');

        // Calculate total earnings
        $totalEarnings = Transaction::whereIn('course_id', $courseIds)
            ->where('status', 'completed')
            ->sum('instructor_amount');

        // Calculate pending earnings (not yet available for withdrawal)
        $pendingEarnings = Transaction::whereIn('course_id', $courseIds)
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(30))
            ->sum('instructor_amount');

        // Calculate available earnings
        $availableEarnings = $totalEarnings - $pendingEarnings;

        // Get recent transactions
        $recentTransactions = Transaction::whereIn('course_id', $courseIds)
            ->where('status', 'completed')
            ->with(['course:id,title,slug', 'user:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // Get monthly earnings for the chart
        $monthlyEarnings = Transaction::whereIn('course_id', $courseIds)
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(12))
            ->select(
                DB::raw('EXTRACT(YEAR FROM created_at) as year'),
                DB::raw('EXTRACT(MONTH FROM created_at) as month'),
                DB::raw('SUM(instructor_amount) as total')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => date('M Y', mktime(0, 0, 0, $item->month, 1, $item->year)),
                    'total' => $item->total
                ];
            });

        // Get withdrawal history
        $withdrawalHistory = WithdrawalRequest::where('user_id', $instructor->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Instructor/Earnings/Index', [
            'totalEarnings' => $totalEarnings,
            'pendingEarnings' => $pendingEarnings,
            'availableEarnings' => $availableEarnings,
            'recentTransactions' => $recentTransactions,
            'monthlyEarnings' => $monthlyEarnings,
            'withdrawalHistory' => $withdrawalHistory
        ]);
    }

    /**
     * Show the form for requesting a withdrawal.
     *
     * @return \Inertia\Response
     */
    public function withdrawForm()
    {
        $instructor = Auth::user();

        // Get all courses by this instructor
        $courseIds = Course::where('user_id', $instructor->id)
            ->pluck('id');

        // Calculate total earnings
        $totalEarnings = Transaction::whereIn('course_id', $courseIds)
            ->where('status', 'completed')
            ->sum('instructor_amount');

        // Calculate pending earnings (not yet available for withdrawal)
        $pendingEarnings = Transaction::whereIn('course_id', $courseIds)
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(30))
            ->sum('instructor_amount');

        // Calculate available earnings
        $availableEarnings = $totalEarnings - $pendingEarnings;

        // Get pending withdrawal requests
        $pendingWithdrawals = WithdrawalRequest::where('user_id', $instructor->id)
            ->where('status', 'pending')
            ->sum('amount');

        // Calculate actual available amount
        $actualAvailableAmount = $availableEarnings - $pendingWithdrawals;

        return Inertia::render('Instructor/Earnings/Withdraw', [
            'availableEarnings' => $actualAvailableAmount,
            'paymentMethods' => $instructor->paymentMethods
        ]);
    }

    /**
     * Process a withdrawal request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function requestWithdrawal(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:50',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'notes' => 'nullable|string|max:500'
        ]);

        $instructor = Auth::user();

        // Get all courses by this instructor
        $courseIds = Course::where('user_id', $instructor->id)
            ->pluck('id');

        // Calculate available earnings
        $totalEarnings = Transaction::whereIn('course_id', $courseIds)
            ->where('status', 'completed')
            ->sum('instructor_amount');

        $pendingEarnings = Transaction::whereIn('course_id', $courseIds)
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(30))
            ->sum('instructor_amount');

        $availableEarnings = $totalEarnings - $pendingEarnings;

        // Get pending withdrawal requests
        $pendingWithdrawals = WithdrawalRequest::where('user_id', $instructor->id)
            ->where('status', 'pending')
            ->sum('amount');

        $actualAvailableAmount = $availableEarnings - $pendingWithdrawals;

        // Check if requested amount is available
        if ($request->amount > $actualAvailableAmount) {
            return back()->withErrors([
                'amount' => 'The requested amount exceeds your available earnings.'
            ]);
        }

        // Create withdrawal request
        WithdrawalRequest::create([
            'user_id' => $instructor->id,
            'amount' => $request->amount,
            'payment_method_id' => $request->payment_method_id,
            'notes' => $request->notes,
            'status' => 'pending'
        ]);

        return redirect()->route('instructor.earnings.index')
            ->with('success', 'Withdrawal request submitted successfully.');
    }

    /**
     * Display earnings statistics for a specific course.
     *
     * @param  \App\Models\Course  $course
     * @return \Inertia\Response
     */
    public function courseEarnings(Course $course)
    {
        // Ensure the instructor owns this course
        if ($course->user_id !== Auth::id()) {
            return redirect()->route('instructor.earnings.index')
                ->with('error', 'You do not have permission to view earnings for this course');
        }

        // Calculate total earnings for this course
        $totalEarnings = Transaction::where('course_id', $course->id)
            ->where('status', 'completed')
            ->sum('instructor_amount');

        // Get monthly earnings for the chart
        $monthlyEarnings = Transaction::where('course_id', $course->id)
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(12))
            ->select(
                DB::raw('EXTRACT(YEAR FROM created_at) as year'),
                DB::raw('EXTRACT(MONTH FROM created_at) as month'),
                DB::raw('SUM(instructor_amount) as total')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => date('M Y', mktime(0, 0, 0, $item->month, 1, $item->year)),
                    'total' => $item->total
                ];
            });

        // Get recent transactions for this course
        $transactions = Transaction::where('course_id', $course->id)
            ->where('status', 'completed')
            ->with(['user:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Instructor/Earnings/Course', [
            'course' => $course,
            'totalEarnings' => $totalEarnings,
            'monthlyEarnings' => $monthlyEarnings,
            'transactions' => $transactions
        ]);
    }
}
