<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WithdrawalRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WithdrawalRequestController extends Controller
{
    /**
     * Display a listing of the withdrawal requests.
     */
    public function index(Request $request)
    {
        $query = WithdrawalRequest::query()
            ->with(['user', 'paymentMethod', 'processor']);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $withdrawalRequests = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/WithdrawalRequests/Index', [
            'withdrawalRequests' => $withdrawalRequests,
            'filters' => [
                'status' => $request->input('status', 'all'),
            ],
            'statuses' => $this->getAvailableStatuses(),
        ]);
    }

    /**
     * Display the specified withdrawal request.
     */
    public function show(WithdrawalRequest $withdrawalRequest)
    {
        $withdrawalRequest->load(['user', 'paymentMethod', 'processor']);

        return Inertia::render('Admin/WithdrawalRequests/Show', [
            'withdrawalRequest' => $withdrawalRequest,
        ]);
    }

    /**
     * Approve a pending withdrawal request.
     */
    public function approve(Request $request, WithdrawalRequest $withdrawalRequest)
    {
        if ($withdrawalRequest->status !== 'pending') {
            return back()->with('error', 'Only pending requests can be approved.');
        }

        DB::beginTransaction();

        try {
            $withdrawalRequest->update([
                'status' => 'approved',
                'processed_by' => Auth::id(),
                'processed_at' => now(),
            ]);

            \App\Models\Transaction::create([
                'user_id' => $withdrawalRequest->user_id,
                'transaction_id' => 'PAYOUT-' . time() . '-' . $withdrawalRequest->id,
                'amount' => -1 * $withdrawalRequest->amount,
                'instructor_amount' => -1 * $withdrawalRequest->amount,
                'currency' => 'IDR',
                'payment_method' => 'withdrawal',
                'status' => 'completed',
                'paid_at' => now(),
                'type' => 'payout',
                'payment_details' => json_encode([
                    'withdrawal_id' => $withdrawalRequest->id,
                    'payment_method_id' => $withdrawalRequest->payment_method_id,
                    'notes' => $withdrawalRequest->notes
                ]),
            ]);

            DB::commit();

            return back()->with('success', 'Withdrawal request approved successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error approving withdrawal request: ' . $e->getMessage());
        }
    }

    /**
     * Reject a pending withdrawal request.
     */
    public function reject(Request $request, WithdrawalRequest $withdrawalRequest)
    {
        if ($withdrawalRequest->status !== 'pending') {
            return back()->with('error', 'Only pending requests can be rejected.');
        }

        DB::beginTransaction();

        try {
            $withdrawalRequest->update([
                'status' => 'rejected',
                'processed_by' => Auth::id(),
                'processed_at' => now(),
            ]);

            DB::commit();

            return back()->with('success', 'Withdrawal request rejected successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error rejecting withdrawal request: ' . $e->getMessage());
        }
    }

    /**
     * Get available withdrawal request statuses for filtering.
     */
    private function getAvailableStatuses(): array
    {
        return [
            'all' => 'All Statuses',
            'pending' => 'Pending',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'processed' => 'Processed',
        ];
    }
}
