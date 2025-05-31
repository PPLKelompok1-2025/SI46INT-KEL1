<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TransactionController extends Controller
{
    /**
     * Display a listing of the student's transactions.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $tab = $request->input('tab', 'purchases');

        if ($tab === 'purchases') {
            $query = Transaction::where('user_id', $user->id)
                ->where('type', 'purchase')
                ->with(['course'])
                ->latest();

            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            $transactions = $query->paginate(10)->withQueryString();

            $totalSpent = Transaction::where('user_id', $user->id)
                ->where('type', 'purchase')
                ->where('status', 'completed')
                ->sum('amount');

            $totalTransactions = Transaction::where('user_id', $user->id)
                ->where('type', 'purchase')
                ->count();

            $pendingTransactions = Transaction::where('user_id', $user->id)
                ->where('type', 'purchase')
                ->where('status', 'pending')
                ->count();

            return Inertia::render('Student/Transactions/Index', [
                'transactions' => $transactions,
                'tab' => $tab,
                'filters' => [
                    'status' => $request->input('status', 'all'),
                ],
                'summary' => [
                    'total_spent' => $totalSpent,
                    'total_transactions' => $totalTransactions,
                    'pending_transactions' => $pendingTransactions,
                ],
                'statuses' => [
                    'all' => 'All Statuses',
                    'completed' => 'Completed',
                    'pending' => 'Pending',
                    'failed' => 'Failed',
                    'refunded' => 'Refunded',
                ],
            ]);
        } else {
            $query = Donation::where('user_id', $user->id)
                ->with(['course', 'course.user:id,name,profile_photo_path'])
                ->latest();

            // Apply filters if provided
            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            $donations = $query->paginate(10)->withQueryString();

            // Calculate summary statistics
            $totalDonated = Donation::where('user_id', $user->id)
                ->where('status', 'completed')
                ->sum('amount');

            $totalDonations = Donation::where('user_id', $user->id)
                ->count();

            $pendingDonations = Donation::where('user_id', $user->id)
                ->where('status', 'pending')
                ->count();

            return Inertia::render('Student/Transactions/Index', [
                'donations' => $donations,
                'tab' => $tab,
                'filters' => [
                    'status' => $request->input('status', 'all'),
                ],
                'summary' => [
                    'total_donated' => $totalDonated,
                    'total_donations' => $totalDonations,
                    'pending_donations' => $pendingDonations,
                ],
                'statuses' => [
                    'all' => 'All Statuses',
                    'completed' => 'Completed',
                    'pending' => 'Pending',
                    'failed' => 'Failed',
                    'cancelled' => 'Cancelled',
                ],
            ]);
        }
    }

    /**
     * Display details of a specific transaction.
     *
     * @param  \App\Models\Transaction  $transaction
     * @return \Inertia\Response
     */
    public function show(Transaction $transaction)
    {
        $user = Auth::user();

        // Ensure the transaction belongs to the user
        if ($transaction->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $transaction->load(['course']);

        return Inertia::render('Student/Transactions/Show', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Display details of a specific donation.
     *
     * @param  \App\Models\Donation  $donation
     * @return \Inertia\Response
     */
    public function showDonation(Donation $donation)
    {
        $user = Auth::user();

        // Ensure the donation belongs to the user
        if ($donation->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $donation->load(['course', 'course.user:id,name,profile_photo_path']);

        return Inertia::render('Student/Transactions/ShowDonation', [
            'donation' => $donation,
        ]);
    }
}
