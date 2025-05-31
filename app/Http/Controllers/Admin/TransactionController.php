<?php

namespace App\Http\Controllers\Admin;

use App\Exports\TransactionsExport;
use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class TransactionController extends Controller
{
    /**
     * Display a listing of the transactions.
     */
    public function index(Request $request)
    {
        $query = Transaction::query()
            ->with(['user', 'course']);

        if ($request->has('sort') && $request->sort) {
            $sortField = 'created_at';
            $sortDirection = 'desc';

            if ($request->sort === 'created_at_asc') {
                $sortField = 'created_at';
                $sortDirection = 'asc';
            } elseif ($request->sort === 'created_at_desc') {
                $sortField = 'created_at';
                $sortDirection = 'desc';
            } elseif ($request->sort === 'amount_desc') {
                $sortField = 'amount';
                $sortDirection = 'desc';
            } elseif ($request->sort === 'amount_asc') {
                $sortField = 'amount';
                $sortDirection = 'asc';
            }

            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($subQuery) use ($search) {
                      $subQuery->where('name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('course', function ($subQuery) use ($search) {
                      $subQuery->where('title', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            if ($request->status !== 'all') {
                $query->where('status', $request->status);
            }
        }

        if ($request->filled('type')) {
            if ($request->type !== 'all') {
                $type = $request->type;
                if ($type === 'purchase') {
                    $query->where('course_id', '!=', null)
                          ->where('type', 'purchase');
                } elseif ($type === 'refund') {
                    $query->where('type', 'refund');
                } elseif ($type === 'payout') {
                    $query->where('course_id', '!=', null)
                          ->where('type', 'payout');
                }
            }
        }

        if ($request->filled('date_range')) {
            $dateRange = $request->date_range;
            if ($dateRange !== 'all') {
                if ($dateRange === 'today') {
                    $query->whereDate('created_at', today());
                } elseif ($dateRange === 'yesterday') {
                    $query->whereDate('created_at', today()->subDay());
                } elseif ($dateRange === 'this_week') {
                    $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                } elseif ($dateRange === 'last_week') {
                    $query->whereBetween('created_at', [now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek()]);
                } elseif ($dateRange === 'this_month') {
                    $query->whereMonth('created_at', now()->month)
                          ->whereYear('created_at', now()->year);
                } elseif ($dateRange === 'last_month') {
                    $query->whereMonth('created_at', now()->subMonth()->month)
                          ->whereYear('created_at', now()->subMonth()->year);
                } elseif ($dateRange === 'this_year') {
                    $query->whereYear('created_at', now()->year);
                } elseif ($dateRange === 'last_year') {
                    $query->whereYear('created_at', now()->subYear()->year);
                }
            }
        }

        $transactions = $query->paginate(10)->withQueryString();

        $summary = [
            'total_transactions' => Transaction::count(),
            'total_revenue' => Transaction::where('status', '!=', 'refunded')->sum('amount'),
            'total_refunded' => Transaction::where('status', 'refunded')->sum('amount'),
            'recent_transactions' => Transaction::whereDate('created_at', '>=', now()->subDays(30))->count(),
            'completed_count' => Transaction::where('status', 'completed')->count(),
            'pending_count' => Transaction::where('status', 'pending')->count(),
            'failed_count' => Transaction::where('status', 'failed')->count(),
            'refunded_count' => Transaction::where('status', 'refunded')->count(),
            'avg_transaction' => Transaction::where('status', 'completed')->avg('amount') ?? 0,
            'most_used_payment' => DB::table('transactions')
                ->select('payment_method', DB::raw('count(*) as count'))
                ->whereNotNull('payment_method')
                ->groupBy('payment_method')
                ->orderByDesc('count')
                ->first(),
            'purchase_count' => Transaction::where('type', 'purchase')->count(),
            'payout_count' => Transaction::where('type', 'payout')->count(),
        ];

        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
                'type' => $request->input('type', 'all'),
                'date_range' => $request->input('date_range', 'all'),
                'sort' => $request->input('sort', 'created_at_desc'),
            ],
            'summary' => $summary,
            'statuses' => $this->getAvailableStatuses(),
            'types' => $this->getAvailableTypes(),
        ]);
    }

    /**
     * Display the specified transaction.
     */
    public function show(Transaction $transaction)
    {
        $transaction->load(['user', 'course']);

        $relatedTransactions = Transaction::where(function ($query) use ($transaction) {
                $query->where('user_id', $transaction->user_id)
                      ->orWhere('course_id', $transaction->course_id);
            })
            ->where('id', '!=', $transaction->id)
            ->with(['user', 'course'])
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Transactions/Show', [
            'transaction' => $transaction,
            'relatedTransactions' => $relatedTransactions,
        ]);
    }

    /**
     * Process a refund for the specified transaction.
     */
    public function refund(Request $request, Transaction $transaction)
    {
        if ($transaction->status === 'refunded') {
            return back()->with('error', 'This transaction has already been refunded.');
        }

        if ($transaction->status !== 'completed') {
            return back()->with('error', 'Only completed transactions can be refunded.');
        }

        DB::beginTransaction();

        try {
            $transaction->update([
                'status' => 'refunded',
                'type' => 'refund',
            ]);

            if ($transaction->course_id) {
                $transaction->user->enrollments()->where('course_id', $transaction->course_id)->delete();
            }

            Transaction::create([
                'user_id' => $transaction->user_id,
                'course_id' => $transaction->course_id,
                'transaction_id' => 'REFUND-' . $transaction->transaction_id,
                'amount' => -1 * $transaction->amount, // Negative amount to indicate refund
                'instructor_amount' => -1 * $transaction->instructor_amount,
                'currency' => $transaction->currency,
                'payment_method' => $transaction->payment_method,
                'status' => 'completed',
                'paid_at' => now(),
                'type' => 'refund',
            ]);

            DB::commit();

            return back()->with('success', 'Transaction has been successfully refunded.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'An error occurred while processing the refund: ' . $e->getMessage());
        }
    }

    /**
     * Export transactions to Excel.
     */
    public function export(Request $request)
    {
        $query = Transaction::query()
            ->with(['user', 'course'])
            ->when($request->has('search'), function ($query) use ($request) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('transaction_id', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($subQuery) use ($search) {
                          $subQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('email', 'like', "%{$search}%");
                      })
                      ->orWhereHas('course', function ($subQuery) use ($search) {
                          $subQuery->where('title', 'like', "%{$search}%");
                      });
                });
            })
            ->when($request->has('status') && $request->get('status') !== 'all', function ($query) use ($request) {
                $query->where('status', $request->get('status'));
            })
            ->when($request->has('type') && $request->get('type') !== 'all', function ($query) use ($request) {
                $status = $request->get('type');
                if ($status === 'purchase') {
                    $query->where('course_id', '!=', null)
                          ->where('status', '!=', 'refunded');
                } elseif ($status === 'refund') {
                    $query->where('status', 'refunded');
                } elseif ($status === 'payout') {
                    $query->where('course_id', null)
                          ->where('instructor_amount', '>', 0);
                }
            })
            ->when($request->has('date_range'), function ($query) use ($request) {
                $dateRange = $request->get('date_range');
                if ($dateRange === 'today') {
                    $query->whereDate('created_at', today());
                } elseif ($dateRange === 'yesterday') {
                    $query->whereDate('created_at', today()->subDay());
                } elseif ($dateRange === 'this_week') {
                    $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                } elseif ($dateRange === 'last_week') {
                    $query->whereBetween('created_at', [now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek()]);
                } elseif ($dateRange === 'this_month') {
                    $query->whereMonth('created_at', now()->month)
                          ->whereYear('created_at', now()->year);
                } elseif ($dateRange === 'last_month') {
                    $query->whereMonth('created_at', now()->subMonth()->month)
                          ->whereYear('created_at', now()->subMonth()->year);
                } elseif ($dateRange === 'this_year') {
                    $query->whereYear('created_at', now()->year);
                } elseif ($dateRange === 'last_year') {
                    $query->whereYear('created_at', now()->subYear()->year);
                } elseif (is_array($dateRange) && isset($dateRange['start'], $dateRange['end'])) {
                    $query->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                }
            });

        if ($request->has('sort')) {
            $sortField = 'created_at';
            $sortDirection = 'desc';

            $sort = $request->get('sort');
            if ($sort === 'created_at_asc') {
                $sortField = 'created_at';
                $sortDirection = 'asc';
            } elseif ($sort === 'created_at_desc') {
                $sortField = 'created_at';
                $sortDirection = 'desc';
            } elseif ($sort === 'amount_desc') {
                $sortField = 'amount';
                $sortDirection = 'desc';
            } elseif ($sort === 'amount_asc') {
                $sortField = 'amount';
                $sortDirection = 'asc';
            }

            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $transactions = $query->get();

        return Excel::download(new TransactionsExport($transactions), 'transactions.xlsx');
    }

    /**
     * Get available transaction statuses for filtering.
     */
    private function getAvailableStatuses()
    {
        return [
            'all' => 'All Statuses',
            'pending' => 'Pending',
            'completed' => 'Completed',
            'failed' => 'Failed',
            'refunded' => 'Refunded',
        ];
    }

    /**
     * Get available transaction types for filtering.
     */
    private function getAvailableTypes()
    {
        return [
            'all' => 'All Types',
            'purchase' => 'Purchase',
            'refund' => 'Refund',
            'payout' => 'Payout',
        ];
    }
}
