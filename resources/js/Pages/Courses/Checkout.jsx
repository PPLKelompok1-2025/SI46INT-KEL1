import { Head, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';

import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Separator } from '@/Components/ui/separator';
import PublicLayout from '@/Layouts/PublicLayout';
import { formatCurrency } from '@/lib/utils';
import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Checkout({ course, promoCodes = [], tax }) {
    const [loading, setLoading] = useState(false);
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [validPromo, setValidPromo] = useState(null);
    const [checkoutDetails, setCheckoutDetails] = useState({
        subtotal: course.price,
        discount: 0,
        tax: tax > 0 ? (course.price * tax) / 100 : 0,
        total: course.price + (tax > 0 ? (course.price * tax) / 100 : 0),
    });

    const { processing } = useForm();
    const { auth } = usePage().props;

    const handleEnrollment = useCallback(async () => {
        if (auth.user.id === course.user_id) {
            router.visit(route('instructor.courses.show', course.id));
            return;
        }

        setLoading(true);

        try {
            if (course.price === 0) {
                const response = await axios.post(
                    route('payment.midtrans.token', course.id),
                );

                if (response.data.success) {
                    toast.success('Successfully enrolled in this free course!');
                    router.visit(response.data.redirect);
                }
            } else {
                const response = await axios.post(
                    route('payment.midtrans.token', course.id),
                    {
                        promoCode: validPromo ? validPromo.code : null,
                        finalAmount: checkoutDetails.total,
                    },
                );

                if (response.data.success && response.data.snap_token) {
                    if (typeof window.snap === 'undefined') {
                        console.error('Midtrans Snap is not loaded properly');
                        toast.error(
                            'Payment system is not ready. Please refresh and try again.',
                        );
                        setLoading(false);
                        return;
                    }

                    try {
                        window.snap.pay(response.data.snap_token, {
                            onSuccess: (result) => {
                                router.visit(
                                    route('payment.midtrans.callback', {
                                        order_id: response.data.order_id,
                                        transaction_status: 'capture',
                                        transaction_time:
                                            new Date().toISOString(),
                                        ...result,
                                    }),
                                );
                            },
                            onPending: (result) => {
                                router.visit(
                                    route('payment.midtrans.callback', {
                                        order_id: response.data.order_id,
                                        transaction_status: 'pending',
                                        transaction_time:
                                            new Date().toISOString(),
                                        ...result,
                                    }),
                                );
                            },
                            onError: (result) => {
                                console.error('Payment error:', result);
                                toast.error(
                                    'Payment failed. Please try again.',
                                );
                                router.visit(
                                    route('payment.midtrans.callback', {
                                        order_id: response.data.order_id,
                                        transaction_status: 'deny',
                                        transaction_time:
                                            new Date().toISOString(),
                                        ...result,
                                    }),
                                );
                            },
                            onClose: () => {
                                setLoading(false);
                                toast.error(
                                    'Payment window was closed without completing the payment.',
                                );
                            },
                        });
                    } catch (snapError) {
                        console.error('Midtrans Snap error:', snapError);
                        toast.error(
                            'Error initializing payment. Please try again.',
                        );
                        setLoading(false);
                    }
                } else if (response.data.redirect) {
                    router.visit(response.data.redirect);
                } else {
                    console.error('Invalid response:', response.data);
                    toast.error(
                        response.data.message ||
                            'Failed to process payment. Please try again.',
                    );
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error('Enrollment error:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                'Failed to process enrollment. Please try again.';
            toast.error(errorMessage);
            setLoading(false);
        }
    }, [auth, course, validPromo, checkoutDetails.total]);

    const validatePromoCode = () => {
        if (!promoCodeInput) {
            toast.error('Please enter a promo code');
            return;
        }

        setLoading(true);

        axios
            .post(route('payment.validate-promo'), {
                code: promoCodeInput,
                courseId: course.id,
            })
            .then((response) => {
                if (response.data.success) {
                    const promoData = {
                        ...response.data,
                        code: response.data.promoCode || promoCodeInput,
                    };
                    setValidPromo(promoData);

                    const subtotal = course.price;
                    const discount = response.data.discountAmount;
                    const newTotal = Math.max(0, subtotal - discount);
                    const taxAmount = tax > 0 ? (newTotal * tax) / 100 : 0;

                    setCheckoutDetails({
                        subtotal,
                        discount,
                        tax: taxAmount,
                        total: newTotal + taxAmount,
                    });

                    toast.success('Promo code applied successfully!');
                }
            })
            .catch((error) => {
                console.error('Error validating promo code:', error);
                toast.error(
                    error.response?.data?.message ||
                        'Failed to validate promo code',
                );
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const removePromoCode = () => {
        setValidPromo(null);
        setPromoCodeInput('');

        const subtotal = course.price;
        const taxAmount = tax > 0 ? (subtotal * tax) / 100 : 0;

        setCheckoutDetails({
            subtotal,
            discount: 0,
            tax: taxAmount,
            total: subtotal + taxAmount,
        });

        toast.error('Promo code removed');
    };

    useEffect(() => {
        if (auth && course.price > 0) {
            const midtransScriptUrl =
                window.config?.midtransSnapUrl ||
                'https://app.sandbox.midtrans.com/snap/snap.js';
            const clientKey = window.config?.midtransClientKey;

            const existingScript = document.getElementById('midtrans-script');
            if (existingScript) {
                existingScript.remove();
            }

            const scriptTag = document.createElement('script');
            scriptTag.src = midtransScriptUrl;
            scriptTag.setAttribute('data-client-key', clientKey);
            scriptTag.setAttribute('id', 'midtrans-script');
            scriptTag.async = true;

            scriptTag.onload = () => {
                console.log('Midtrans script loaded successfully');
            };

            scriptTag.onerror = (error) => {
                console.error('Failed to load Midtrans script:', error);
            };

            document.body.appendChild(scriptTag);

            return () => {
                const scriptToRemove =
                    document.getElementById('midtrans-script');
                if (scriptToRemove) {
                    scriptToRemove.remove();
                }
            };
        }
    }, [auth, course.price]);

    return (
        <PublicLayout>
            <Head title={`Checkout - ${course.title}`} />

            <div className="container py-8 md:py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Checkout
                    </h1>
                    <p className="text-muted-foreground">
                        Complete your enrollment for {course.title}
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-4 md:flex-row">
                                    <div className="aspect-video w-full max-w-[180px] overflow-hidden rounded-md bg-muted">
                                        {course.thumbnail ? (
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <span className="text-muted-foreground">
                                                    No thumbnail
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-2 text-xl font-semibold">
                                            {course.title}
                                        </h3>
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {course.categories?.map(
                                                (category) => (
                                                    <Badge
                                                        key={category.id}
                                                        variant="secondary"
                                                    >
                                                        {category.name}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                        <p className="mb-3 text-sm text-muted-foreground">
                                            {/* By {course.user.name} •{' '} */}
                                            {course.lessons_count} lessons •{' '}
                                            {course.level}
                                        </p>
                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                            {course.description}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {promoCodes.length > 0 && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Available Promo Codes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {promoCodes.map((promo) => (
                                            <Card
                                                key={promo.id}
                                                className="border p-3"
                                            >
                                                <div className="mb-2 flex justify-between">
                                                    <span className="font-mono font-semibold text-primary">
                                                        {promo.code}
                                                    </span>
                                                    <Button
                                                        className="bg-green-500"
                                                        size="sm"
                                                        onClick={() => {
                                                            setPromoCodeInput(
                                                                promo.code,
                                                            );
                                                            validatePromoCode();
                                                        }}
                                                    >
                                                        Apply
                                                    </Button>
                                                </div>
                                                <p className="mb-1 text-sm text-muted-foreground">
                                                    {promo.description}
                                                </p>
                                                <p className="text-sm">
                                                    {promo.discount_type ===
                                                    'percentage'
                                                        ? `${promo.discount_value}% off`
                                                        : `${formatCurrency(promo.discount_value)} off`}
                                                </p>
                                                {promo.end_date && (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Expires:{' '}
                                                        {new Date(
                                                            promo.end_date,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="promoCode">
                                            Have a promo code?
                                        </Label>
                                        <div className="mt-1 flex space-x-2">
                                            <Input
                                                id="promoCode"
                                                value={promoCodeInput}
                                                onChange={(e) =>
                                                    setPromoCodeInput(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Enter promo code"
                                                disabled={
                                                    loading || !!validPromo
                                                }
                                            />
                                            {validPromo ? (
                                                <Button
                                                    variant="outline"
                                                    onClick={removePromoCode}
                                                    disabled={loading}
                                                >
                                                    Remove
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    onClick={validatePromoCode}
                                                    disabled={
                                                        loading ||
                                                        !promoCodeInput
                                                    }
                                                >
                                                    Apply
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {validPromo && (
                                        <div className="rounded-md bg-primary/10 p-3">
                                            <div className="mb-1 flex justify-between">
                                                <span className="font-medium">
                                                    {validPromo.promoCode}
                                                </span>
                                                <span className="font-medium text-primary">
                                                    Applied!
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {validPromo.discountType ===
                                                'percentage'
                                                    ? `${validPromo.discountValue}% off`
                                                    : `${formatCurrency(validPromo.discountValue)} off`}
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Subtotal
                                            </span>
                                            <span>
                                                {formatCurrency(
                                                    checkoutDetails.subtotal,
                                                )}
                                            </span>
                                        </div>

                                        {checkoutDetails.discount > 0 && (
                                            <div className="flex justify-between text-primary">
                                                <span>Discount</span>
                                                <span>
                                                    -
                                                    {formatCurrency(
                                                        checkoutDetails.discount,
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        {checkoutDetails.tax > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Tax ({tax}%)
                                                </span>
                                                <span>
                                                    {formatCurrency(
                                                        checkoutDetails.tax,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between text-lg font-medium">
                                        <span>Total</span>
                                        <span>
                                            {formatCurrency(
                                                checkoutDetails.total,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col">
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleEnrollment}
                                    disabled={loading || processing}
                                >
                                    {checkoutDetails.total === 0
                                        ? 'Enroll for Free'
                                        : `Pay ${formatCurrency(checkoutDetails.total)}`}
                                </Button>

                                <div className="mt-4 text-center text-xs text-muted-foreground">
                                    By completing this purchase, you agree to
                                    our Terms of Service and Privacy Policy.
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
