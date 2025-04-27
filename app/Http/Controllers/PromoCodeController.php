<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\PromoCodes;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    /**
     * Validate a promo code
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */

    public function validatePromoCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'courseId' => 'required|exists:courses,id',
        ]);

        $course = Course::findOrFail($request->courseId);
        $promoCode = PromoCodes::where('code', $request->code)->first();

        if (!$promoCode) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid promo code'
            ], 404);
        }

        $isValid = $promoCode->isValid($course->price);
        if (!$isValid) {
            return response()->json([
                'success' => false,
                'message' => 'This promo code is not valid for this purchase'
            ], 400);
        }

        $discountAmount = $promoCode->calculateDiscount($course->price);
        $finalPrice = $course->price - $discountAmount;

        return response()->json([
            'success' => true,
            'promoCode' => $promoCode->code,
            'discountType' => $promoCode->discount_type,
            'discountValue' => $promoCode->discount_value,
            'discountAmount' => $discountAmount,
            'finalPrice' => max(0, $finalPrice),
        ]);
    }
}
