<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Donation;
use App\Models\Transaction;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DonationController extends Controller
{
    /**
     * Display a listing of the donations for authenticated user.
     */
    public function index()
    {
        $donations = Donation::where('user_id', Auth::id())
            ->with(['course', 'course.user:id,name,profile_photo_path'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Donations/Index', [
            'donations' => $donations
        ]);
    }

    /**
     * Display a listing of the donations received for a course.
     */
    public function courseIndex(Course $course)
    {
        if (Auth::id() !== $course->user_id) {
            abort(403, 'You do not have permission to view donations for this course.');
        }

        $donations = Donation::where('course_id', $course->id)
            ->with(['user:id,name,profile_photo_path'])
            ->successful()
            ->latest()
            ->paginate(10);

        return Inertia::render('Instructor/Donations/Index', [
            'course' => $course,
            'donations' => $donations
        ]);
    }

    /**
     * Process a donation for a course.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\JsonResponse
     */
    public function process(Request $request, Course $course)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
                'redirect' => route('login', ['redirect_to' => route('courses.show', $course->slug)])
            ], 401);
        }

        $request->validate([
            'amount' => 'required|numeric|min:1000',
            'message' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $amount = $request->input('amount');
        $message = $request->input('message');
        $orderId = 'DONATION-' . time() . '-' . $user->id . '-' . Str::random(5);

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

            $transaction_details = [
                'order_id' => $orderId,
                'gross_amount' => (int) $amount,
            ];

            $item_details = [
                [
                    'id' => 'donation-' . $course->id,
                    'price' => (int) $amount,
                    'quantity' => 1,
                    'name' => 'Donation for: ' . Str::limit($course->title, 40),
                    'category' => 'Donation',
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

            // Create transaction record
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'order_id' => $orderId,
                'transaction_id' => 'DON-' . time() . '-' . $user->id . '-' . Str::random(5),
                'amount' => $amount,
                'payment_method' => 'midtrans',
                'status' => 'pending',
                'currency' => 'IDR',
                'payment_details' => json_encode(['type' => 'donation']),
                'type' => 'donation',
            ]);

            // Create donation record
            $donation = Donation::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'transaction_id' => $transaction->id,
                'order_id' => $orderId,
                'amount' => $amount,
                'status' => 'pending',
                'message' => $message,
                'payment_details' => json_encode([
                    'created_at' => now()->toIso8601String(),
                    'message' => $message
                ]),
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
                        'trace' => $errorTrace,
                        'type' => 'donation'
                    ]);
                    $transaction->save();

                    $donation->status = 'failed';
                    $donation->save();

                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to process donation. Please try again.',
                        'debug_message' => app()->environment('local') ? $errorMessage : null,
                        'error' => app()->environment('local') ? $errorMessage : 'Payment service error'
                    ], 500);
                }
            } catch (Exception $e) {
                Log::error('Midtrans donation error: ' . $e->getMessage());

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to process donation. Please try again.',
                    'debug_message' => app()->environment('local') ? $e->getMessage() : null,
                    'error' => app()->environment('local') ? $e->getMessage() : 'Payment service error'
                ], 500);
            }
        } catch (Exception $e) {
            Log::error('Midtrans general error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to process donation. Please try again.',
                'debug_message' => app()->environment('local') ? $e->getMessage() : null,
                'error' => app()->environment('local') ? $e->getMessage() : 'Payment service error'
            ], 500);
        }
    }

    /**
     * Handle the notification from Midtrans for donation payments.
     */
    public function handleCallback(Request $request)
    {
        $orderId = $request->input('order_id');

        if (!$orderId) {
            return redirect()->route('home')
                ->with('error', 'Invalid request. Order ID is missing.');
        }

        // Only handle donation-specific order IDs
        if (!Str::startsWith($orderId, 'DONATION-')) {
            return redirect()->route('home')
                ->with('error', 'Invalid donation request.');
        }

        $donation = Donation::where('order_id', $orderId)->with(['course', 'user'])->first();
        $transaction = Transaction::where('order_id', $orderId)->first();

        if (!$donation || !$transaction) {
            return redirect()->route('home')
                ->with('error', 'Donation not found. Please contact support if you believe this is an error.');
        }

        $transactionStatus = $request->input('transaction_status', 'unknown');
        $fraudStatus = $request->input('fraud_status', null);
        $paymentType = $request->input('payment_type', null);

        $oldStatus = $donation->status;

        // Preserve existing payment details
        $existingDetails = json_decode($donation->payment_details ?? '[]', true);

        switch ($transactionStatus) {
            case 'capture':
                if ($paymentType == 'credit_card') {
                    if ($fraudStatus == 'challenge') {
                        $donation->status = 'challenge';
                        $transaction->status = 'challenge';
                        $message = 'Your donation is being reviewed.';
                        $messageType = 'info';
                    } else {
                        $donation->status = 'completed';
                        $donation->donated_at = now();
                        $transaction->status = 'completed';
                        $transaction->paid_at = now();
                        $message = 'Thank you for your donation!';
                        $messageType = 'success';
                    }
                } else {
                    $donation->status = 'completed';
                    $donation->donated_at = now();
                    $transaction->status = 'completed';
                    $transaction->paid_at = now();
                    $message = 'Thank you for your donation!';
                    $messageType = 'success';
                }
                break;

            case 'settlement':
                $donation->status = 'completed';
                $donation->donated_at = now();
                $transaction->status = 'completed';
                $transaction->paid_at = now();
                $message = 'Thank you for your donation!';
                $messageType = 'success';
                break;

            case 'pending':
                $donation->status = 'pending';
                $transaction->status = 'pending';
                $message = 'Your donation is being processed.';
                $messageType = 'info';
                break;

            case 'deny':
                $donation->status = 'failed';
                $transaction->status = 'failed';
                $message = 'Your donation was denied. Please try a different payment method.';
                $messageType = 'error';
                break;

            case 'expire':
                $donation->status = 'expired';
                $transaction->status = 'expired';
                $message = 'Your donation session has expired. Please try again.';
                $messageType = 'error';
                break;

            case 'cancel':
                $donation->status = 'cancelled';
                $transaction->status = 'cancelled';
                $message = 'Donation was cancelled.';
                $messageType = 'error';
                break;

            default:
                $donation->status = 'unknown';
                $transaction->status = 'unknown';
                $message = 'An unknown error occurred with your donation. Please contact support.';
                $messageType = 'error';
                break;
        }

        // Update payment details
        $donation->payment_details = json_encode(array_merge($existingDetails, [
            'status' => $transactionStatus,
            'fraud_status' => $fraudStatus,
            'payment_type' => $paymentType,
            'updated_at' => now()->toIso8601String(),
            'raw_response' => $request->all(),
        ]));

        $transaction->payment_details = json_encode(array_merge(
            json_decode($transaction->payment_details ?? '{}', true),
            [
                'status' => $transactionStatus,
                'fraud_status' => $fraudStatus,
                'payment_type' => $paymentType,
                'updated_at' => now()->toIso8601String(),
                'raw_response' => $request->all(),
            ]
        ));

        $donation->save();
        $transaction->save();

        if ($oldStatus !== $donation->status) {
            Log::info("Donation {$orderId} status changed from {$oldStatus} to {$donation->status}");
        }

        return redirect()->route('courses.show', $donation->course->slug)
            ->with($messageType, $message);
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
     * Handle Midtrans notification callback from server-to-server postback for donations.
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

            // Only handle donation-specific order IDs
            if (!Str::startsWith($orderId, 'DONATION-')) {
                return response('Not a donation', 200);
            }

            $transactionStatus = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status ?? null;
            $paymentType = $notification->payment_type ?? null;

            $donation = Donation::where('order_id', $orderId)->first();
            $transaction = Transaction::where('order_id', $orderId)->first();

            if (!$donation || !$transaction) {
                return response('Donation not found', 404);
            }

            $oldStatus = $donation->status;

            // Preserve existing payment details
            $existingDonationDetails = json_decode($donation->payment_details ?? '[]', true);
            $existingTransactionDetails = json_decode($transaction->payment_details ?? '[]', true);

            switch ($transactionStatus) {
                case 'capture':
                    if ($fraudStatus == 'challenge') {
                        $donation->status = 'challenge';
                        $transaction->status = 'challenge';
                    } else if ($fraudStatus == 'accept') {
                        $donation->status = 'completed';
                        $donation->donated_at = now();
                        $transaction->status = 'completed';
                        $transaction->paid_at = now();
                    }
                    break;

                case 'settlement':
                    $donation->status = 'completed';
                    $donation->donated_at = now();
                    $transaction->status = 'completed';
                    $transaction->paid_at = now();
                    break;

                case 'deny':
                    $donation->status = 'failed';
                    $transaction->status = 'failed';
                    break;

                case 'cancel':
                    $donation->status = 'cancelled';
                    $transaction->status = 'cancelled';
                    break;

                case 'expire':
                    $donation->status = 'expired';
                    $transaction->status = 'expired';
                    break;

                case 'pending':
                    $donation->status = 'pending';
                    $transaction->status = 'pending';
                    break;

                default:
                    $donation->status = 'unknown';
                    $transaction->status = 'unknown';
                    break;
            }

            $donation->payment_details = json_encode(array_merge($existingDonationDetails, [
                'status' => $transactionStatus,
                'fraud_status' => $fraudStatus,
                'payment_type' => $paymentType,
                'updated_at' => now()->toIso8601String(),
                'raw_response' => $request->all(),
            ]));

            $transaction->payment_details = json_encode(array_merge($existingTransactionDetails, [
                'status' => $transactionStatus,
                'fraud_status' => $fraudStatus,
                'payment_type' => $paymentType,
                'time' => $notification->transaction_time ?? now(),
                'updated_at' => now()->toIso8601String(),
                'raw_response' => $request->all(),
            ]));

            $donation->save();
            $transaction->save();

            if ($oldStatus !== $donation->status) {
                Log::info("Donation {$orderId} status changed from {$oldStatus} to {$donation->status} (server notification)");
            }

            return response('OK', 200);
        } catch (Exception $e) {
            Log::error('Midtrans donation notification error: ' . $e->getMessage());
            return response('Error: ' . $e->getMessage(), 500);
        }
    }
}
