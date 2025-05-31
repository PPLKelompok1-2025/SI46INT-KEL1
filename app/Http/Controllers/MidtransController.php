<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\PromoCodes;
use App\Models\Transaction;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MidtransController extends Controller
{
    /**
     * Generate Snap token for Midtrans payment.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSnapToken(Request $request, Course $course)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
                'redirect' => route('login', ['redirect_to' => route('courses.show', $course->slug)])
            ], 401);
        }

        $user = Auth::user();

        if ($user->id === $course->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot enroll in your own course',
                'redirect' => route('instructor.courses.show', $course->id)
            ], 403);
        }

        $existingEnrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existingEnrollment) {
            return response()->json([
                'success' => false,
                'message' => 'You are already enrolled in this course',
                'redirect' => route('student.courses.show', $course->slug)
            ], 400);
        }

        $orderId = 'ORDER-' . time() . '-' . $user->id . '-' . Str::random(5);

        // Get the final amount from request (with discount applied) or use course price
        $finalAmount = $request->input('finalAmount', $course->price);
        $promoCode = $request->input('promoCode');

        // Validate promo code if provided
        $promoDetails = null;
        if ($promoCode) {
            $promo = PromoCodes::where('code', $promoCode)
                ->where(function($query) {
                    $query->whereNull('end_date')
                        ->orWhere('end_date', '>=', now());
                })
                ->first();

            if ($promo) {
                $promoDetails = [
                    'code' => $promo->code,
                    'discount_type' => $promo->discount_type,
                    'discount_value' => $promo->discount_value
                ];
            }
        }

        try {
            \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
            \Midtrans\Config::$isProduction = config('services.midtrans.is_production', false);
            \Midtrans\Config::$isSanitized = config('services.midtrans.is_sanitized', true);
            \Midtrans\Config::$is3ds = config('services.midtrans.is_3ds', true);

            if (!app()->environment('production')) {
                \Midtrans\Config::$curlOptions = [
                    CURLOPT_SSL_VERIFYHOST => 0,
                    CURLOPT_SSL_VERIFYPEER => 0
                ];
            }

            if ($course->price === 0 || $finalAmount === 0) {
                Enrollment::create([
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                    'status' => 'active',
                    'enrolled_at' => now(),
                    'order_id' => $orderId
                ]);

                Transaction::create([
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                    'order_id' => $orderId,
                    'transaction_id' => 'FREE-' . time() . '-' . $user->id . '-' . Str::random(5),
                    'amount' => 0,
                    'payment_method' => 'free',
                    'status' => 'completed',
                    'currency' => 'IDR',
                    'payment_details' => json_encode(['method' => 'free_course', 'promo_code' => $promoCode]),
                    'type' => 'purchase',
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Successfully enrolled in this free course',
                    'redirect' => route('student.courses.show', $course->slug)
                ]);
            }

            $transaction_details = [
                'order_id' => $orderId,
                'gross_amount' => (int) $finalAmount,
            ];

            $item_details = [
                [
                    'id' => $course->id,
                    'price' => (int) $finalAmount,
                    'quantity' => 1,
                    'name' => Str::limit($course->title, 40),
                    'category' => $course->category->name ?? 'Course',
                    'url' => route('courses.show', $course->slug),
                ]
            ];

            $customer_details = [
                'first_name' => explode(' ', $user->name)[0],
                'last_name' => count(explode(' ', $user->name)) > 1 ? explode(' ', $user->name)[1] : '',
                'email' => $user->email,
                'phone' => $user->phone ?? '',
            ];

            $params = [
                'transaction_details' => $transaction_details,
                'item_details' => $item_details,
                'customer_details' => $customer_details,
            ];

            $transaction = Transaction::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'order_id' => $orderId,
                'transaction_id' => 'TRX-' . time() . '-' . $user->id . '-' . Str::random(5),
                'amount' => $finalAmount,
                'payment_method' => 'midtrans',
                'status' => 'pending',
                'currency' => 'IDR',
                'payment_details' => json_encode([
                    'promo_code' => $promoCode,
                    'promo_details' => $promoDetails,
                    'original_price' => $course->price,
                    'discounted_price' => $finalAmount
                ]),
                'type' => 'purchase',
            ]);

            try {
                try {
                    $snapToken = \Midtrans\Snap::getSnapToken($params);

                    return response()->json([
                        'success' => true,
                        'snap_token' => $snapToken,
                        'order_id' => $orderId,
                    ]);
                } catch (\Exception $snapError) {
                    if (strpos($snapError->getMessage(), 'Undefined array key 10023') !== false) {
                        $snapToken = $this->getSnapTokenManually($params);

                        if ($snapToken) {
                            return response()->json([
                                'success' => true,
                                'snap_token' => $snapToken,
                                'order_id' => $orderId,
                            ]);
                        }
                    }

                    Log::error('Midtrans Snap token error: ' . $snapError->getMessage());
                    $errorMessage = $snapError->getMessage();
                    $errorTrace = $snapError->getTraceAsString();

                    $transaction->status = 'failed';
                    $transaction->payment_details = json_encode([
                        'error' => $errorMessage,
                        'trace' => $errorTrace
                    ]);
                    $transaction->save();

                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to process payment. Please try again.',
                        'debug_message' => app()->environment('local') ? $errorMessage : null,
                        'error' => app()->environment('local') ? $errorMessage : 'Payment service error'
                    ], 500);
                }
            } catch (Exception $e) {
                Log::error('Midtrans general error: ' . $e->getMessage());

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to process payment. Please try again.',
                    'debug_message' => app()->environment('local') ? $e->getMessage() : null,
                    'error' => app()->environment('local') ? $e->getMessage() : 'Payment service error'
                ], 500);
            }
        } catch (Exception $e) {
            Log::error('Midtrans general error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to process payment. Please try again.',
                'debug_message' => app()->environment('local') ? $e->getMessage() : null,
                'error' => app()->environment('local') ? $e->getMessage() : 'Payment service error'
            ], 500);
        }
    }

    /**
     * Get Snap Token manually using cURL instead of the Midtrans library.
     * This is a fallback method to handle the "Undefined array key 10023" error.
     *
     * @param array $params Transaction parameters
     * @return string|null Snap token if successful, null otherwise
     */
    private function getSnapTokenManually($params)
    {
        try {
            $url = config('services.midtrans.is_production', false) ?
                'https://app.midtrans.com/snap/v1/transactions' :
                'https://app.sandbox.midtrans.com/snap/v1/transactions';

            $serverKey = config('services.midtrans.server_key');

            $curl = curl_init();

            curl_setopt_array($curl, [
                CURLOPT_URL => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode($params),
                CURLOPT_HTTPHEADER => [
                    'Accept: application/json',
                    'Content-Type: application/json',
                    'Authorization: Basic ' . base64_encode($serverKey . ':')
                ],
                CURLOPT_SSL_VERIFYHOST => 0,
                CURLOPT_SSL_VERIFYPEER => 0
            ]);

            $response = curl_exec($curl);
            $error = curl_error($curl);

            curl_close($curl);

            if ($error) {
                Log::error('Manual cURL error: ' . $error);
                return null;
            }

            $responseData = json_decode($response, true);

            if (isset($responseData['token'])) {
                return $responseData['token'];
            }

            Log::error('Manual Snap token error: ' . json_encode($responseData));
            return null;
        } catch (\Exception $e) {
            Log::error('Manual Snap token exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Handle Midtrans callback for all transaction statuses.
     * This is a unified handler for different payment outcomes.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleCallback(Request $request)
    {
        $orderId = $request->input('order_id');
        $transaction = Transaction::where('order_id', $orderId)
            ->with(['course', 'user'])
            ->first();

        if (!$transaction) {
            return redirect()->route('home')
                ->with('error', 'Transaction not found. Please contact support if you believe this is an error.');
        }

        $transactionStatus = $request->input('transaction_status', 'unknown');
        $fraudStatus = $request->input('fraud_status', null);
        $paymentType = $request->input('payment_type', null);

        $statusChanged = false;
        $oldStatus = $transaction->status;

        // Preserve existing payment details
        $existingDetails = json_decode($transaction->payment_details ?? '{}', true);

        switch ($transactionStatus) {
            case 'capture':
                if ($paymentType == 'credit_card') {
                    if ($fraudStatus == 'challenge') {
                        $transaction->status = 'challenge';
                        $message = 'Your payment is being reviewed. You will be enrolled once payment is verified.';
                        $messageType = 'info';
                    } else {
                        $transaction->status = 'completed';
                        $message = 'Payment successful! You are now enrolled in this course.';
                        $messageType = 'success';
                    }
                } else {
                    $transaction->status = 'completed';
                    $message = 'Payment successful! You are now enrolled in this course.';
                    $messageType = 'success';
                }
                break;

            case 'settlement':
                $transaction->status = 'completed';
                $transaction->paid_at = now();
                $message = 'Payment successful! You are now enrolled in this course.';
                $messageType = 'success';
                break;

            case 'pending':
                $transaction->status = 'pending';
                $message = 'Your payment is being processed. You will be enrolled once payment is complete.';
                $messageType = 'info';
                break;

            case 'deny':
                $transaction->status = 'failed';
                $message = 'Your payment was denied. Please try a different payment method.';
                $messageType = 'error';
                break;

            case 'expire':
                $transaction->status = 'expired';
                $message = 'Your payment session has expired. Please try enrolling again.';
                $messageType = 'error';
                break;

            case 'cancel':
                $transaction->status = 'cancelled';
                $message = 'Payment was cancelled. Please try enrolling again if you still want to join this course.';
                $messageType = 'error';
                break;

            default:
                $transaction->status = 'unknown';
                $message = 'An unknown error occurred with your payment. Please contact support.';
                $messageType = 'error';
                break;
        }

        $statusChanged = $oldStatus !== $transaction->status;

        $transaction->payment_details = json_encode(array_merge($existingDetails, [
            'status' => $transactionStatus,
            'fraud_status' => $fraudStatus,
            'payment_type' => $paymentType,
            'updated_at' => now()->toIso8601String(),
            'raw_response' => $request->all(),
        ]));

        $transaction->save();

        if ($transaction->status === 'completed') {
            $this->createEnrollment($transaction);
        }

        if ($statusChanged) {
            Log::info("Transaction {$orderId} status changed from {$oldStatus} to {$transaction->status}");
        }

        if ($transaction->status === 'completed') {
            return redirect()->route('student.courses.show', $transaction->course->slug)
                ->with($messageType, $message);
        } else {
            return redirect()->route('courses.show', $transaction->course->slug)
                ->with($messageType, $message);
        }
    }

    /**
     * Create enrollment for a completed transaction.
     *
     * @param  \App\Models\Transaction  $transaction
     * @return void
     */
    private function createEnrollment($transaction)
    {
        $enrollment = Enrollment::where('user_id', $transaction->user_id)
            ->where('course_id', $transaction->course_id)
            ->first();

        if (!$enrollment && $transaction->status === 'completed') {
            Enrollment::create([
                'user_id' => $transaction->user_id,
                'course_id' => $transaction->course_id,
                'status' => 'active',
                'enrolled_at' => now(),
                'order_id' => $transaction->order_id,
            ]);
        }
    }

    /**
     * Handle Midtrans notification callback from server-to-server postback.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function handleNotification(Request $request)
    {
        \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
        \Midtrans\Config::$isProduction = config('services.midtrans.is_production', false);

        if (!app()->environment('production')) {
            \Midtrans\Config::$curlOptions = [
                CURLOPT_SSL_VERIFYHOST => 0,
                CURLOPT_SSL_VERIFYPEER => 0
            ];
        }

        try {
            $notification = new \Midtrans\Notification();

            $orderId = $notification->order_id;
            $transactionStatus = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status ?? null;
            $paymentType = $notification->payment_type ?? null;

            $transaction = Transaction::where('order_id', $orderId)->first();

            if (!$transaction) {
                return response('Transaction not found', 404);
            }

            $oldStatus = $transaction->status;

            // Preserve existing payment details
            $existingDetails = json_decode($transaction->payment_details ?? '{}', true);

            switch ($transactionStatus) {
                case 'capture':
                    if ($fraudStatus == 'challenge') {
                        $transaction->status = 'challenge';
                    } else if ($fraudStatus == 'accept') {
                        $transaction->status = 'completed';
                        $transaction->paid_at = now();
                    }
                    break;

                case 'settlement':
                    $transaction->status = 'completed';
                    $transaction->paid_at = now();
                    break;

                case 'deny':
                    $transaction->status = 'failed';
                    break;

                case 'cancel':
                    $transaction->status = 'cancelled';
                    break;

                case 'expire':
                    $transaction->status = 'expired';
                    break;

                case 'pending':
                    $transaction->status = 'pending';
                    break;

                default:
                    $transaction->status = 'unknown';
                    break;
            }

            $transaction->payment_details = json_encode(array_merge($existingDetails, [
                'status' => $transactionStatus,
                'fraud_status' => $fraudStatus,
                'payment_type' => $paymentType,
                'time' => $notification->transaction_time ?? now(),
                'updated_at' => now()->toIso8601String(),
                'raw_response' => $request->all(),
            ]));

            $transaction->save();

            if ($transaction->status === 'completed') {
                $this->createEnrollment($transaction);
            }
            if ($oldStatus !== $transaction->status) {
                Log::info("Transaction {$orderId} status changed from {$oldStatus} to {$transaction->status} (server notification)");
            }

            return response('OK', 200);
        } catch (Exception $e) {
            Log::error('Midtrans notification error: ' . $e->getMessage());
            return response('Error: ' . $e->getMessage(), 500);
        }
    }
}
