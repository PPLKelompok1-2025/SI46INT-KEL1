<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PaymentMethodController extends Controller
{
    /**
     * Display a listing of the instructor's payment methods.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $paymentMethods = PaymentMethod::where('user_id', Auth::id())
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Instructor/PaymentMethods/Index', [
            'paymentMethods' => $paymentMethods
        ]);
    }

    /**
     * Show the form for creating a new payment method.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('Instructor/PaymentMethods/Create');
    }

    /**
     * Store a newly created payment method in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:bank_transfer,paypal',
            'is_default' => 'nullable|boolean',
        ] + $this->getTypeSpecificValidationRules($request->type));

        $user = Auth::user();

        // If this is the first payment method or is_default is true, make sure all others are not default
        if ($request->is_default || !$user->paymentMethods()->exists()) {
            $user->paymentMethods()->update(['is_default' => false]);
            $request->merge(['is_default' => true]);
        }

        $paymentMethod = PaymentMethod::create([
            'user_id' => $user->id,
            'type' => $request->type,
            'account_name' => $request->account_name,
            'account_number' => $request->account_number,
            'bank_name' => $request->bank_name,
            'paypal_email' => $request->paypal_email,
            'is_default' => $request->is_default ?? false,
            'details' => $request->details ?? [],
        ]);

        return redirect()->route('instructor.payment-methods.index')
            ->with('success', 'Payment method added successfully.');
    }

    /**
     * Show the form for editing the specified payment method.
     *
     * @param  \App\Models\PaymentMethod  $paymentMethod
     * @return \Inertia\Response
     */
    public function edit(PaymentMethod $paymentMethod)
    {
        // Ensure the payment method belongs to the authenticated user
        if ($paymentMethod->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('Instructor/PaymentMethods/Edit', [
            'paymentMethod' => $paymentMethod
        ]);
    }

    /**
     * Update the specified payment method in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\PaymentMethod  $paymentMethod
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        // Ensure the payment method belongs to the authenticated user
        if ($paymentMethod->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'type' => 'required|in:bank_transfer,paypal',
            'is_default' => 'nullable|boolean',
        ] + $this->getTypeSpecificValidationRules($request->type, $paymentMethod->id));

        $user = Auth::user();

        // If setting this payment method as default, update others
        if ($request->is_default && !$paymentMethod->is_default) {
            $user->paymentMethods()->where('id', '!=', $paymentMethod->id)
                ->update(['is_default' => false]);
        }

        $paymentMethod->update([
            'type' => $request->type,
            'account_name' => $request->account_name,
            'account_number' => $request->account_number,
            'bank_name' => $request->bank_name,
            'paypal_email' => $request->paypal_email,
            'is_default' => $request->is_default ?? $paymentMethod->is_default,
            'details' => $request->details ?? $paymentMethod->details,
        ]);

        return redirect()->route('instructor.payment-methods.index')
            ->with('success', 'Payment method updated successfully.');
    }

    /**
     * Remove the specified payment method from storage.
     *
     * @param  \App\Models\PaymentMethod  $paymentMethod
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(PaymentMethod $paymentMethod)
    {
        // Ensure the payment method belongs to the authenticated user
        if ($paymentMethod->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Check if this payment method has been used in any withdrawal requests
        if ($paymentMethod->withdrawalRequests()->exists()) {
            return back()->with('error', 'Cannot delete this payment method as it has been used in withdrawal requests.');
        }

        // If this is the default payment method and there are others, make another one default
        if ($paymentMethod->is_default) {
            $otherPaymentMethod = PaymentMethod::where('user_id', Auth::id())
                ->where('id', '!=', $paymentMethod->id)
                ->first();

            if ($otherPaymentMethod) {
                $otherPaymentMethod->update(['is_default' => true]);
            }
        }

        $paymentMethod->delete();

        return redirect()->route('instructor.payment-methods.index')
            ->with('success', 'Payment method deleted successfully.');
    }

    /**
     * Set the specified payment method as default.
     *
     * @param  \App\Models\PaymentMethod  $paymentMethod
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setDefault(PaymentMethod $paymentMethod)
    {
        // Ensure the payment method belongs to the authenticated user
        if ($paymentMethod->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Update all payment methods to not be default
        PaymentMethod::where('user_id', Auth::id())
            ->update(['is_default' => false]);

        // Set this one as default
        $paymentMethod->update(['is_default' => true]);

        return back()->with('success', 'Default payment method updated.');
    }

    /**
     * Get validation rules specific to the payment method type.
     *
     * @param string $type
     * @param int|null $ignoreId
     * @return array
     */
    private function getTypeSpecificValidationRules($type, $ignoreId = null)
    {
        $rules = [];

        if ($type === 'bank_transfer') {
            $rules = [
                'account_name' => 'required|string|max:100',
                'account_number' => 'required|string|max:50',
                'bank_name' => 'required|string|max:100',
            ];
        } elseif ($type === 'paypal') {
            $emailRule = 'required|email|max:100';

            // If updating an existing record, add unique constraint with exception for the current record
            if ($ignoreId) {
                $emailRule .= '|unique:payment_methods,paypal_email,' . $ignoreId;
            } else {
                $emailRule .= '|unique:payment_methods,paypal_email';
            }

            $rules = [
                'paypal_email' => $emailRule,
            ];
        }

        return $rules;
    }
}
