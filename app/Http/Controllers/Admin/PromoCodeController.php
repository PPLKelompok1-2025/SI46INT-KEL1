<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromoCodes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PromoCodeController extends Controller
{
    /**
     * Display a listing of promo codes.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $sort = $request->input('sort', 'created_at_desc');

        $query = PromoCodes::query()
            ->withCount('transactions');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status === 'active') {
            $query->where('is_active', true)
                  ->where(function ($q) {
                      $q->whereNull('end_date')
                        ->orWhere('end_date', '>=', now());
                  })
                  ->where(function ($q) {
                      $q->whereNull('max_uses')
                        ->orWhereRaw('used_count < max_uses');
                  });
        } elseif ($status === 'expired') {
            $query->where(function ($q) {
                $q->where('is_active', false)
                  ->orWhere(function ($sq) {
                      $sq->whereNotNull('end_date')
                         ->where('end_date', '<', now());
                  })
                  ->orWhere(function ($sq) {
                      $sq->whereNotNull('max_uses')
                         ->whereRaw('used_count >= max_uses');
                  });
            });
        }

        switch ($sort) {
            case 'code_asc':
                $query->orderBy('code');
                break;
            case 'code_desc':
                $query->orderByDesc('code');
                break;
            case 'usage_asc':
                $query->orderBy('used_count');
                break;
            case 'usage_desc':
                $query->orderByDesc('used_count');
                break;
            case 'created_at_asc':
                $query->orderBy('created_at');
                break;
            case 'created_at_desc':
            default:
                $query->orderByDesc('created_at');
                break;
        }

        $promoCodes = $query->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/PromoCodes/Index', [
            'promoCodes' => $promoCodes,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'sort' => $sort,
            ],
            'stats' => [
                'total' => PromoCodes::count(),
                'active' => PromoCodes::where('is_active', true)
                    ->where(function ($q) {
                        $q->whereNull('end_date')
                          ->orWhere('end_date', '>=', now());
                    })
                    ->where(function ($q) {
                        $q->whereNull('max_uses')
                          ->orWhereRaw('used_count < max_uses');
                    })
                    ->count(),
                'expired' => PromoCodes::where(function ($q) {
                        $q->where('is_active', false)
                          ->orWhere(function ($sq) {
                              $sq->whereNotNull('end_date')
                                 ->where('end_date', '<', now());
                          })
                          ->orWhere(function ($sq) {
                              $sq->whereNotNull('max_uses')
                                 ->whereRaw('used_count >= max_uses');
                          });
                    })
                    ->count(),
                'used' => PromoCodes::where('used_count', '>', 0)->count(),
                'totalTransactions' => DB::table('transactions')
                    ->whereNotNull('promo_code_id')
                    ->count(),
                'totalDiscounts' => DB::table('transactions')
                    ->whereNotNull('promo_code_id')
                    ->sum('discount_amount'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new promo code.
     */
    public function create()
    {
        return Inertia::render('Admin/PromoCodes/Create');
    }

    /**
     * Store a newly created promo code in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:promo_codes',
            'description' => 'nullable|string|max:255',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0|max:' . ($request->input('discount_type') === 'percentage' ? '100' : '10000'),
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'max_uses' => 'nullable|integer|min:1',
            'min_cart_value' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $promoCode = PromoCodes::create($validated);

        return redirect()->route('admin.promo-codes.show', $promoCode->id)
            ->with('success', 'Promo code created successfully');
    }

    /**
     * Display the specified promo code.
     */
    public function show(PromoCodes $promoCode)
    {
        $promoCode->load('transactions.user', 'transactions.course');

        $usageByMonth = DB::table('transactions')
            ->selectRaw('to_char(created_at, \'YYYY-MM\') as month, COUNT(*) as count, SUM(discount_amount) as total_discount')
            ->where('promo_code_id', $promoCode->id)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return Inertia::render('Admin/PromoCodes/Show', [
            'promoCode' => $promoCode,
            'usageByMonth' => $usageByMonth,
            'isValid' => $promoCode->isValid(),
            'recentTransactions' => $promoCode->transactions()
                ->with('user:id,name,email', 'course:id,title,slug')
                ->latest()
                ->take(5)
                ->get(),
        ]);
    }

    /**
     * Show the form for editing the specified promo code.
     */
    public function edit(PromoCodes $promoCode)
    {
        return Inertia::render('Admin/PromoCodes/Edit', [
            'promoCode' => $promoCode,
        ]);
    }

    /**
     * Update the specified promo code in storage.
     */
    public function update(Request $request, PromoCodes $promoCode)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:promo_codes,code,' . $promoCode->id,
            'description' => 'nullable|string|max:255',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0|max:' . ($request->input('discount_type') === 'percentage' ? '100' : '10000'),
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'max_uses' => 'nullable|integer|min:1',
            'min_cart_value' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $promoCode->update($validated);

        return redirect()->route('admin.promo-codes.show', $promoCode->id)
            ->with('success', 'Promo code updated successfully');
    }

    /**
     * Toggle the active status of the specified promo code.
     */
    public function toggleActive(PromoCodes $promoCode)
    {
        $promoCode->update([
            'is_active' => !$promoCode->is_active,
        ]);

        return back()->with('success', 'Promo code status updated successfully');
    }

    /**
     * Remove the specified promo code from storage.
     */
    public function destroy(PromoCodes $promoCode)
    {
        if ($promoCode->transactions()->count() > 0) {
            return back()->with('error', 'Cannot delete a promo code that has been used in transactions');
        }

        $promoCode->delete();

        return redirect()->route('admin.promo-codes.index')
            ->with('success', 'Promo code deleted successfully');
    }
}
